import api from './api';

/**
 * Shape of a single Google review, normalized for the UI.
 * `time` is a human-readable relative string (e.g. "2 weeks ago") —
 * Google's Places API gives us this directly as relativePublishTimeDescription,
 * so we don't need to compute it on the client.
 */
export interface GoogleReview {
  id: string;
  name: string;
  time: string;
  text: string;
  rating: number; // 1–5
  avatar?: string; // reviewer's Google profile photo, if available
}

interface GoogleReviewsResponse {
  rating: number;
  reviewCount: number;
  reviews: GoogleReview[];
}

/**
 * Reads cached Google reviews from our own WordPress backend
 * (see medmeu-app-reviews-api.php) — never calls Google directly from
 * the app, since that would require shipping a Places API key inside
 * the client bundle.
 */
export const reviewsService = {
  async getGoogleReviews(limit = 8): Promise<GoogleReviewsResponse> {
    const { data } = await api.get<GoogleReviewsResponse>('/medmeu/v1/google-reviews', {
      params: { limit },
    });
    return data;
  },
};