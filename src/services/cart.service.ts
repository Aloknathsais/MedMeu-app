import api from './api';
import { CartItem } from '../context/AppContext';

/**
 * Note on return types: every mutating call here re-fetches the full
 * cart via list() rather than trusting whatever shape that specific
 * backend endpoint hands back (addToCart returns one item, a quantity
 * update might return one item OR the full array if it dropped to
 * zero and got removed — see cart.service.js on the backend). Re-listing
 * keeps the frontend always in sync with one predictable shape
 * (CartItem[]) regardless of what each backend action returns, at the
 * cost of one extra request per mutation. Same "trust the server's
 * confirmed state, not what you assume happened" principle as
 * writeAndVerify() on the backend — worth the extra round trip.
 */
export const cartService = {
  async list(): Promise<CartItem[]> {
    const { data: envelope } = await api.get('/cart');
    return envelope.data;
  },

  async add(item: CartItem): Promise<CartItem[]> {
    await api.post('/cart', item);
    return cartService.list();
  },

  async updateQuantity(id: string, quantity: number): Promise<CartItem[]> {
    await api.put(`/cart/${id}`, { quantity });
    return cartService.list();
  },

  async remove(id: string): Promise<CartItem[]> {
    await api.delete(`/cart/${id}`);
    return cartService.list();
  },

  async clear(): Promise<CartItem[]> {
    await api.delete('/cart');
    return cartService.list();
  },
};