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
  images: { src: string }[];
  short_description?: string;
}
/**
 * The shape HomePage's existing <ProductCard /> and addToCart() already
 * expect (previously satisfied by mockProducts). Keeping this shape means
 * NONE of the JSX/rendering logic in HomePage needs to change — only
 * where the data comes from.
 */
export interface UiProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  /**
   * WooCommerce has no native "unit" concept (e.g. "500mg", "10 tablets").
   * Left blank until that's added as a product attribute/meta field on
   * the WooCommerce side — flagging rather than fabricating a value.
   */
  unit: string;
  /** Plain-text short description, if WooCommerce has one — used for real Offer Zone cards. */
  shortDescription?: string;
}

const FALLBACK_IMAGE = 'https://via.placeholder.com/300x300?text=No+Image';

function mapWcProductToUi(p: WcProduct): UiProduct {
  const price = parseFloat(p.price) || 0;
  const regularPrice = parseFloat(p.regular_price) || price;
  const discount = p.on_sale && regularPrice > price
    ? Math.round(((regularPrice - price) / regularPrice) * 100)
    : 0;

  return {
    id: String(p.id),
    name: p.name,
    price,
    originalPrice: regularPrice,
    discount,
    image: p.images?.[0]?.src || FALLBACK_IMAGE,
    rating: parseFloat(p.average_rating) || 0,
    reviews: p.rating_count || 0,
    inStock: p.stock_status === 'instock',
    unit: '',
    shortDescription: p.short_description
      ? p.short_description.replace(/<[^>]*>/g, '').trim()
      : undefined,
  };
}

export interface ListProductsParams {
  search?: string;
  featured?: boolean;
  on_sale?: boolean;
  category?: string | number;
  page?: number;
  per_page?: number;
}

export const productsService = {
  async list(params: ListProductsParams = {}): Promise<UiProduct[]> {
    const { data: envelope } = await api.get('/products', { params });
    const raw: WcProduct[] = envelope.data;
    return raw.map(mapWcProductToUi);
  },

  /**
   * Was filtering by featured=true, but nothing in the WooCommerce
   * catalog is currently flagged as "featured" (that's a per-product
   * toggle in WP Admin), so it returned an empty list. Just pulls the
   * first `perPage` products instead — flip back to `{ featured: true }`
   * once products are actually marked featured in WooCommerce.
   */
  async getHomeProducts(perPage = 8): Promise<UiProduct[]> {
    return productsService.list({ per_page: perPage });
  },

  /** Real on-sale products for the Offer Zone — backed by WooCommerce's own on_sale flag. */
  async getOnSale(perPage = 6): Promise<UiProduct[]> {
    return productsService.list({ on_sale: true, per_page: perPage });
  },

  async search(query: string, perPage = 20): Promise<UiProduct[]> {
    if (!query.trim()) return [];
    return productsService.list({ search: query, per_page: perPage });
  },

  async getById(id: string | number): Promise<UiProduct> {
    const { data: envelope } = await api.get(`/products/${id}`);
    return mapWcProductToUi(envelope.data);
  },
};