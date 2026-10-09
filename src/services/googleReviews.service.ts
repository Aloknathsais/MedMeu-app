import api from './api';

export interface GoogleReview {
  authorName: string | null;
  authorUrl: string | null;
  authorPhotoUrl: string | null;
  rating: number | null;
  text: string;
  relativeTime: string | null;
  time: number | null;
}

export interface GoogleReviewsData {
  name: string;
  rating: number | null;
  totalReviews: number;
  googleMapsUrl: string | null;
  /** Max 5 — Google's own Places API hard cap, not something we're truncating. */
  reviews: GoogleReview[];
}

export const googleReviewsService = {
  async get(): Promise<GoogleReviewsData> {
    const { data: envelope } = await api.get('/google-reviews');
    return envelope.data;
  },
};