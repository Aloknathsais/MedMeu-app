import api from './api';

/** Raw shape returned by the backend's GET /categories (passthrough from WooCommerce). */
interface WcCategory {
  id: number;
  name: string;
  count: number;
  image: { src: string } | null;
  /** 0 = top-level category. Non-zero = this category's parent id. Real WooCommerce hierarchy. */
  parent: number;
}

/**
 * WooCommerce categories have no "icon" (emoji) or "color" field — those
 * were mock-data-only decorations. This shape drops them rather than
 * fabricating values; pages render a real category image when one
 * exists, and a plain first-letter badge when it doesn't (same fallback
 * pattern already used elsewhere in the app, e.g. the profile avatar).
 */
export interface UiCategory {
  id: string;
  name: string;
  count: number;
  image: string | null;
  parentId: string;
}

function mapWcCategoryToUi(c: WcCategory): UiCategory {
  return {
    id: String(c.id),
    name: c.name,
    count: c.count,
    image: c.image?.src || null,
    parentId: String(c.parent || 0),
  };
}

export interface CategoryTree {
  topLevel: UiCategory[];
  /** Keyed by parent category id — only present for parents that actually have children. */
  childrenByParent: Record<string, UiCategory[]>;
}

export const categoriesService = {
  async list(): Promise<UiCategory[]> {
    const { data: envelope } = await api.get('/categories', { params: { per_page: 20, hide_empty: true } });
    const raw: WcCategory[] = envelope.data;
    return raw.map(mapWcCategoryToUi);
  },

  /**
   * Fetches the full category set (up to 100 — plenty for a typical
   * store) and builds a real parent/child tree from WooCommerce's own
   * `parent` field, for the Products page's category chips + inline
   * subcategory panel. Not fabricated — a category only appears as a
   * "subcategory" here because it genuinely has that parent in WooCommerce.
   */
  async getTree(): Promise<CategoryTree> {
    const { data: envelope } = await api.get('/categories', { params: { per_page: 100, hide_empty: true } });
    const raw: WcCategory[] = envelope.data;
    const all = raw.map(mapWcCategoryToUi);

    const topLevel = all.filter(c => c.parentId === '0');
    const childrenByParent: Record<string, UiCategory[]> = {};
    all.forEach(c => {
      if (c.parentId !== '0') {
        (childrenByParent[c.parentId] ||= []).push(c);
      }
    });

    return { topLevel, childrenByParent };
  },
};