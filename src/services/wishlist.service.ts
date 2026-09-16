import api from './api';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
  addedAt: number | null;
}

export interface WishlistData {
  key: string;
  items: WishlistItem[];
}

const GUEST_KEY_STORAGE = 'medmeu_wishlist_guest_key';

function isLoggedIn(): boolean {
  try {
    return !!localStorage.getItem('medmeu_token');
  } catch {
    return false;
  }
}

function getStoredGuestKey(): string | undefined {
  try {
    return localStorage.getItem(GUEST_KEY_STORAGE) || undefined;
  } catch {
    return undefined;
  }
}

function storeGuestKey(key: string) {
  try {
    localStorage.setItem(GUEST_KEY_STORAGE, key);
  } catch {
    // Non-fatal — worst case, the next request just gets treated as a
    // brand-new guest and the backend generates another key.
  }
}

/**
 * Only relevant when NOT logged in. Logged-in customers use their real
 * WooCommerce identity server-side — no local key needed, and using
 * one would be wrong (it'd fragment one customer's wishlist across
 * multiple "guest" keys on different devices instead of following
 * their account). Mirrors what the website's browser cookie does; the
 * app has no cookie, so this does the same job via localStorage.
 *
 * Every response includes the key actually in use server-side — always
 * re-persisted here, covering both "first-ever guest action" (server
 * generates a fresh one) and keeping us in sync if it ever changes.
 */
export const wishlistService = {
  async list(): Promise<WishlistData> {
    const guestKey = isLoggedIn() ? undefined : getStoredGuestKey();
    const { data: envelope } = await api.get('/wishlist', {
      params: guestKey ? { guest_key: guestKey } : {},
    });
    if (!isLoggedIn()) storeGuestKey(envelope.data.key);
    return envelope.data;
  },

  async add(productId: string): Promise<WishlistData> {
    const guestKey = isLoggedIn() ? undefined : getStoredGuestKey();
    const { data: envelope } = await api.post('/wishlist/add', {
      product_id: Number(productId),
      guest_key: guestKey,
    });
    if (!isLoggedIn()) storeGuestKey(envelope.data.key);
    return envelope.data;
  },

  async remove(productId: string): Promise<WishlistData> {
    const guestKey = isLoggedIn() ? undefined : getStoredGuestKey();
    const { data: envelope } = await api.post('/wishlist/remove', {
      product_id: Number(productId),
      guest_key: guestKey,
    });
    if (!isLoggedIn()) storeGuestKey(envelope.data.key);
    return envelope.data;
  },
};