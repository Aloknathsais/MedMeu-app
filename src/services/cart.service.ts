import api from './api';
import { CartItem } from '../context/AppContext';

/** Cart mutation endpoints return the server-confirmed full cart. */
export const cartService = {
  async list(): Promise<CartItem[]> {
    const { data: envelope } = await api.get('/cart');
    return envelope.data;
  },

  async add(item: CartItem): Promise<CartItem[]> {
    const { data: envelope } = await api.post('/cart', item);
    return envelope.data;
  },

  async updateQuantity(id: string, quantity: number): Promise<CartItem[]> {
    const { data: envelope } = await api.put(`/cart/${id}`, { quantity });
    return envelope.data;
  },

  async remove(id: string): Promise<CartItem[]> {
    const { data: envelope } = await api.delete(`/cart/${id}`);
    return envelope.data;
  },

  async clear(): Promise<CartItem[]> {
    const { data: envelope } = await api.delete('/cart');
    return envelope.data;
  },

  /**
   * Converts the real cart into a real WooCommerce order. Throws on
   * failure — including a real server-side rejection (below minimum
   * order value, an item that just went out of stock, an invalid
   * address) — the caller is expected to surface
   * err.response?.data?.message, same pattern used everywhere else.
   * Does NOT clear local cart state itself; the backend empties the
   * real cart as part of a successful checkout, so call list()/rely on
   * the next cart load to reflect the now-empty cart.
   */
  async checkout(addressId: string, paymentMethod: 'cod' = 'cod'): Promise<OrderConfirmation> {
    const { data: envelope } = await api.post('/cart/checkout', { addressId, paymentMethod });
    return envelope.data;
  },
};

export interface OrderConfirmation {
  orderId: number;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string | null;
}