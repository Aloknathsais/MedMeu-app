import api from './api';

/** Raw shape returned by the backend's GET /products (passthrough from WooCommerce). */
interface WcProduct {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  average_rating: string;
  rating_count: number;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number | null;
  manage_stock: boolean;
  images: { src: string }[];
  /** WooCommerce native field — string, in whatever unit the store's Settings > General > Measurements > Weight unit is set to. Assumed kg here to match the shipping tier config; confirm in wp-admin if shipping costs look wrong. */
  weight?: string;
  short_description?: string;
  description?: string;
  categories?: { id: number; name: string }[];
  /** Real spec data — options/variants configured on the product in WooCommerce. */
  attributes?: { name: string; options: string[] }[];
}

/**
 * The shape both ProductsPage and ProductDetailPage work with. Kept as
 * close as possible to the old mock shape so existing JSX needs minimal
 * changes — extended with real fields (images[], specs[], description)
 * that the mock data never had but the detail page actually needs.
 */
export interface UiProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  /** First image — used by list/grid/card views. */
  image: string;
  /** All product images — used by the detail page's gallery. Always has at least one entry. */
  images: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  /** Only set when WooCommerce is actually tracking stock for this product. */
  stockQuantity?: number;
  /**
   * WooCommerce has no native "unit" concept (e.g. "500mg", "10 tablets").
   * Left blank until that's added as a product attribute/meta field on
   * the WooCommerce side — flagging rather than fabricating a value.
   */
  unit: string;
  /**
   * Weight in kg (assumed — see WcProduct.weight comment). Used to
   * calculate the real weight-based delivery charge in CartPage.tsx.
   * Falls back to 0 when WooCommerce has no weight set for this
   * product — under-charges shipping for that item rather than
   * blocking anything, same defensive posture as `unit`.
   */
  weight: number;
  /** Plain-text short description. */
  shortDescription?: string;
  /** Full description, as raw HTML from WooCommerce's own product editor (trusted first-party content). */
  descriptionHtml?: string;
  /** Real spec lines built from WooCommerce product attributes — empty array if none are configured. */
  specs: { name: string; value: string }[];
  categoryIds: number[];
}

const FALLBACK_IMAGE = 'https://via.placeholder.com/300x300?text=No+Image';

function mapWcProductToUi(p: WcProduct): UiProduct {
  const price = parseFloat(p.price) || 0;
  const regularPrice = parseFloat(p.regular_price) || price;
  const discount = p.on_sale && regularPrice > price
    ? Math.round(((regularPrice - price) / regularPrice) * 100)
    : 0;
  const images = p.images?.length ? p.images.map(i => i.src) : [FALLBACK_IMAGE];

  return {
    id: String(p.id),
    name: p.name,
    price,
    originalPrice: regularPrice,
    discount,
    image: images[0],
    images,
    rating: parseFloat(p.average_rating) || 0,
    reviews: p.rating_count || 0,
    inStock: p.stock_status === 'instock',
    stockQuantity: p.manage_stock && p.stock_quantity != null ? p.stock_quantity : undefined,
    unit: '',
    weight: parseFloat(p.weight ?? '') || 0,
    shortDescription: p.short_description
      ? p.short_description.replace(/<[^>]*>/g, '').trim()
      : undefined,
    descriptionHtml: p.description || undefined,
    specs: (p.attributes || [])
      .filter(a => a.options?.length)
      .map(a => ({ name: a.name, value: a.options.join(', ') })),
    categoryIds: p.categories?.map(c => c.id) || [],
  };
}

export interface ListProductsParams {
  search?: string;
  on_sale?: boolean;
  category?: string | number;
  min_price?: number;
  max_price?: number;
  stock_status?: 'instock' | 'outofstock';
  orderby?: 'date' | 'price' | 'popularity' | 'rating' | 'title';
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface ProductListResult {
  products: UiProduct[];
  page: number;
  totalPages: number;
  total: number;
}

export const productsService = {
  async list(params: ListProductsParams = {}): Promise<ProductListResult> {
    const { data: envelope } = await api.get('/products', { params });
    const raw: WcProduct[] = envelope.data;
    return {
      products: raw.map(mapWcProductToUi),
      page: envelope.meta?.page ?? 1,
      totalPages: envelope.meta?.totalPages ?? 1,
      total: envelope.meta?.total ?? raw.length,
    };
  },

  /**
   * Was filtering by featured=true, but nothing in the WooCommerce
   * catalog is currently flagged as "featured" (that's a per-product
   * toggle in WP Admin), so it returned an empty list. Just pulls the
   * first `perPage` products instead — flip back to `{ featured: true }`
   * once products are actually marked featured in WooCommerce.
   */
  async getHomeProducts(perPage = 8): Promise<UiProduct[]> {
    return (await productsService.list({ per_page: perPage })).products;
  },

  /** Real on-sale products for the Offer Zone — backed by WooCommerce's own on_sale flag. */
  async getOnSale(perPage = 6): Promise<UiProduct[]> {
    return (await productsService.list({ on_sale: true, per_page: perPage })).products;
  },

  async search(query: string, perPage = 20): Promise<UiProduct[]> {
    if (!query.trim()) return [];
    return (await productsService.list({ search: query, per_page: perPage })).products;
  },

  async getById(id: string | number): Promise<UiProduct> {
    const { data: envelope } = await api.get(`/products/${id}`);
    return mapWcProductToUi(envelope.data);
  },
};