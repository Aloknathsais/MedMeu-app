import api from './api';

export interface GoogleReview {
  authorName: string;
  authorPhotoUrl: string;
  rating: number;
  text: string;
  relativeTime: string;
  time: number;
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