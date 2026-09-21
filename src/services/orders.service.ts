import api from './api';

/** Raw shape returned by WooCommerce's /orders (passthrough from the backend). */
interface WcOrderLineItem {
  id: number;
  name: string;
  product_id: number;
  quantity: number;
  total: string;
  image?: { id: string; src: string };
}
interface WcOrderAddress {
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  phone?: string;
  email?: string;
}
interface WcOrder {
  id: number;
  number: string;
  status: string; // pending | processing | on-hold | completed | cancelled | refunded | failed | trash
  date_created: string;
  date_completed: string | null;
  total: string;
  shipping_total: string;
  payment_method: string;
  payment_method_title: string;
  billing: WcOrderAddress;
  shipping: WcOrderAddress;
  line_items: WcOrderLineItem[];
}

/**
 * Simplified down from WooCommerce's real statuses. NOTE: there is no
 * real "in transit" state here — WooCommerce natively only tracks
 * "is this order done or not," not physical delivery progress, unless
 * a shipment-tracking plugin is involved (not something we've
 * investigated — same unknown as banners/wishlist before we checked).
 * pending/processing/on-hold are all folded into 'processing' rather
 * than inventing fake granularity the backend can't actually confirm.
 */
export type UiOrderStatus = 'processing' | 'delivered' | 'cancelled';

export interface UiOrderItem {
  id: number;
  /** The actual WooCommerce product ID — use this for navigation to the product detail page, NOT `id` above (which is the order line item's own ID, unrelated to the product). */
  productId: number;
  name: string;
  quantity: number;
  /** Per-unit price, derived from the real line total / quantity. */
  price: number;
  /** Real line total for this item, straight from WooCommerce. */
  total: number;
  image: string;
}

export interface UiOrder {
  id: number;
  orderNumber: string;
  status: UiOrderStatus;
  /** The real, unmapped WooCommerce status — use this if you need the actual value (e.g. 'on-hold' vs 'processing') rather than the simplified UI bucket. */
  rawStatus: string;
  dateCreated: string;
  dateCompleted: string | null;
  total: number;
  itemTotal: number;
  shippingTotal: number;
  itemCount: number;
  items: UiOrderItem[];
  paymentMethod: string;
  paymentMethodTitle: string;
  address: {
    name: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  /**
   * Whether the CUSTOMER can still cancel this order — mirrors the
   * backend's own real check (pending/processing/on-hold only). Used
   * to conditionally show the Cancel button; the backend remains the
   * authoritative check regardless of what this says, same "never
   * trust the client" principle used throughout this app.
   */
  isCancellable: boolean;
}

function mapStatus(wcStatus: string): UiOrderStatus {
  if (wcStatus === 'completed') return 'delivered';
  if (wcStatus === 'cancelled' || wcStatus === 'refunded' || wcStatus === 'failed') return 'cancelled';
  return 'processing'; // pending, processing, on-hold
}

const CANCELLABLE_STATUSES = ['pending', 'processing', 'on-hold'];

function mapOrder(o: WcOrder): UiOrder {
  const items: UiOrderItem[] = (o.line_items || []).map((li) => {
    const total = parseFloat(li.total) || 0;
    return {
      id: li.id,
      productId: li.product_id,
      quantity: li.quantity,
      name: li.name,
      price: li.quantity > 0 ? total / li.quantity : total,
      total,
      image: li.image?.src || '',
    };
  });
  const itemTotal = items.reduce((s, i) => s + i.total, 0);

  // Real order address — shipping if set, falling back to billing
  // (this app currently sends the same address for both at checkout,
  // but a future change on either side shouldn't break this).
  const addr = o.shipping?.address_1 ? o.shipping : o.billing;

  return {
    id: o.id,
    orderNumber: o.number,
    status: mapStatus(o.status),
    rawStatus: o.status,
    dateCreated: o.date_created,
    dateCompleted: o.date_completed,
    total: parseFloat(o.total) || 0,
    itemTotal,
    shippingTotal: parseFloat(o.shipping_total || '0') || 0,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    items,
    paymentMethod: o.payment_method,
    paymentMethodTitle: o.payment_method_title,
    address: {
      name: [addr?.first_name, addr?.last_name].filter(Boolean).join(' '),
      line1: addr?.address_1 || '',
      line2: addr?.address_2 || '',
      city: addr?.city || '',
      state: addr?.state || '',
      pincode: addr?.postcode || '',
      phone: o.billing?.phone || '',
    },
    isCancellable: CANCELLABLE_STATUSES.includes(o.status),
  };
}

export interface OrderListResult {
  orders: UiOrder[];
  page: number;
  totalPages: number;
  total: number;
}

export const ordersService = {
  async getMyOrderCount(): Promise<number> {
    const { data: envelope } = await api.get('/orders/mine', { params: { per_page: 1 } });
    return envelope.meta?.total ?? 0;
  },

  async list(params: { page?: number; per_page?: number; status?: string } = {}): Promise<OrderListResult> {
    const { data: envelope } = await api.get('/orders/mine', { params });
    const raw: WcOrder[] = envelope.data;
    return {
      orders: raw.map(mapOrder),
      page: envelope.meta?.page ?? 1,
      totalPages: envelope.meta?.totalPages ?? 1,
      total: envelope.meta?.total ?? raw.length,
    };
  },

  async getById(id: string | number): Promise<UiOrder> {
    const { data: envelope } = await api.get(`/orders/mine/${id}`);
    return mapOrder(envelope.data);
  },

  async cancel(id: string | number, reason: string): Promise<UiOrder> {
    const { data: envelope } = await api.put(`/orders/mine/${id}/cancel`, { reason });
    return mapOrder(envelope.data);
  },

  /**
   * Downloads and displays the order's invoice PDF.
   *
   * The endpoint requires auth (our JWT), so a plain <a href> or
   * window.open(url) can't be used directly — neither sends our
   * Authorization header. Instead this fetches the PDF as a blob via
   * the normal authenticated api client, then displays it.
   *
   * `targetWindow`: pass a window handle opened SYNCHRONOUSLY inside
   * the button's onClick — i.e. `window.open('', '_blank')` called
   * BEFORE this function runs, not after. Most mobile browsers/WebViews
   * block window.open() calls that happen after an `await` (no longer
   * considered a direct user gesture) — opening the blank window first
   * and filling in its location once the PDF is ready avoids that.
   */
  async downloadInvoice(id: string | number, targetWindow?: Window | null): Promise<void> {
    const response = await api.get(`/orders/mine/${id}/invoice`, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    if (targetWindow) {
      targetWindow.location.href = url;
    } else {
      // Fallback if no pre-opened window was passed — may be blocked
      // as a popup on some browsers/WebViews since it happens after
      // an await, but still correct on platforms that allow it.
      window.open(url, '_blank');
    }

    // Revoke after a delay long enough for the browser/WebView to
    // actually load it — revoking immediately can break the view
    // before it finishes loading.
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  },
};