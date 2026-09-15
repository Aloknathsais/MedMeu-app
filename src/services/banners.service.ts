import api from './api';

export interface Banner {
  id: string;
  bg: string;
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  /** In-app path (e.g. "/products?category=123") or a full external URL. See navigateToBanner() usage in HomePage.tsx. */
  link: string;
}

export const bannersService = {
  async list(): Promise<Banner[]> {
    const { data: envelope } = await api.get('/banners');
    return envelope.data;
  },
};