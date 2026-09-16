import api from './api';

/** Raw shape returned by WooCommerce's /products/reviews (passthrough from the backend). */
interface WcProductReview {
  id: number;
  product_id: number;
  reviewer: string;
  /** WooCommerce returns this as HTML (e.g. "<p>Great product</p>\n"), not plain text. */
  review: string;
  rating: number;
  date_created: string;
  verified: boolean;
  status?: string;
  reviewer_avatar_urls?: Record<string, string>;
}

export interface ProductReview {
  id: number;
  productId: number;
  reviewer: string;
  /** Plain text — HTML tags stripped. Never render this with dangerouslySetInnerHTML: it's user-submitted content, not trusted first-party content like a product description. */
  reviewText: string;
  rating: number;
  dateCreated: string;
  verified: boolean;
  /** Gravatar URL — WooCommerce/Gravatar always returns a default "mystery person" image even for unregistered emails, so this should essentially always be non-empty. */
  avatarUrl: string;
}

export interface SubmitReviewInput {
  rating: number;
  review: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function mapReview(r: WcProductReview): ProductReview {
  const avatars = r.reviewer_avatar_urls || {};
  return {
    id: r.id,
    productId: r.product_id,
    reviewer: r.reviewer,
    reviewText: stripHtml(r.review || ''),
    rating: r.rating,
    dateCreated: r.date_created,
    verified: r.verified,
    // Prefer a mid-size avatar; fall back to whatever size is present.
    avatarUrl: avatars['48'] || avatars['96'] || avatars['24'] || '',
  };
}

export const reviewsService = {
  async list(productId: string | number): Promise<ProductReview[]> {
    const { data: envelope } = await api.get(`/reviews/${productId}`);
    const raw: WcProductReview[] = envelope.data;
    return raw.map(mapReview);
  },

  /**
   * Backend fills in reviewer name/email from the logged-in customer's
   * real WooCommerce record — only rating + review text go over the
   * wire. Throws if not logged in (route requires auth) or validation
   * fails (rating out of 1–5, empty text).
   */
  async submit(productId: string | number, input: SubmitReviewInput): Promise<ProductReview> {
    const { data: envelope } = await api.post(`/reviews/${productId}`, input);
    return mapReview(envelope.data);
  },
};