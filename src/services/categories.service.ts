import api from './api';

/** Raw shape returned by the backend's GET /categories (passthrough from WooCommerce). */
interface WcCategory {
  id: number;
  name: string;
  count: number;
  image: { src: string } | null;
}

/**
 * WooCommerce categories have no "icon" (emoji) or "color" field — those
 * were mock-data-only decorations. This shape drops them rather than
 * fabricating values; HomePage renders a real category image when one
 * exists, and a plain first-letter badge when it doesn't (same fallback
 * pattern already used elsewhere in the app, e.g. the profile avatar).
 */
export interface UiCategory {
  id: string;
  name: string;
  count: number;
  image: string | null;
}

function mapWcCategoryToUi(c: WcCategory): UiCategory {
  return {
    id: String(c.id),
    name: c.name,
    count: c.count,
    image: c.image?.src || null,
  };
}

export const categoriesService = {
  async list(): Promise<UiCategory[]> {
    const { data: envelope } = await api.get('/categories', { params: { per_page: 20, hide_empty: true } });
    const raw: WcCategory[] = envelope.data;
    return raw.map(mapWcCategoryToUi);
  },
};