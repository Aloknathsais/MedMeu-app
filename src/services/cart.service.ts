import api from './api';
import { CartItem } from '../context/AppContext';

/**
 * Note on return types: every mutating call here re-fetches the full
 * cart via list() rather than trusting whatever shape that specific
 * backend endpoint hands back (addToCart returns one item, a quantity
 * update might return one item OR the full array if it dropped to
 * zero and got removed — see cart.service.js on the backend). Re-listing
 * keeps the frontend always in sync with one predictable shape
 * (CartItem[]) regardless of what each backend action returns, at the
 * cost of one extra request per mutation. Same "trust the server's
 * confirmed state, not what you assume happened" principle as
 * writeAndVerify() on the backend — worth the extra round trip.
 */
export const cartService = {
  async list(): Promise<CartItem[]> {
    const { data: envelope } = await api.get('/cart');
    return envelope.data;
  },

  async add(item: CartItem): Promise<CartItem[]> {
    await api.post('/cart', item);
    return cartService.list();
  },

  async updateQuantity(id: string, quantity: number): Promise<CartItem[]> {
    await api.put(`/cart/${id}`, { quantity });
    return cartService.list();
  },

  async remove(id: string): Promise<CartItem[]> {
    await api.delete(`/cart/${id}`);
    return cartService.list();
  },

  async clear(): Promise<CartItem[]> {
    await api.delete('/cart');
    return cartService.list();
  },

  /**
   * Converts the real cart into a real WooCommerce order. Throws on
   * failure — including a real server-side rejection (below minimum
   * order value, an item that just went out of stock, an invalid
   * address) — the caller is expected to surface
   * err.response?.data?.message, same pattern used everywhere else.
   * Does NOT clear local cart state itself; the backend empties the
   * real cart as part of a successful checkout, so call list()/rely on
   * the next cart load to reflect the now-empty cart.
   */
  async checkout(addressId: string, paymentMethod: 'cod' = 'cod'): Promise<OrderConfirmation> {
    const { data: envelope } = await api.post('/cart/checkout', { addressId, paymentMethod });
    return envelope.data;
  },
};

export interface OrderConfirmation {
  orderId: number;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string | null;
}