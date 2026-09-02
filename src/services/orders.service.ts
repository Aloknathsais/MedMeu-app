import api from './api';

export const ordersService = {
  /**
   * Just the total count for ProfilePage's stats row — pulled from the
   * backend's real pagination meta rather than fetching every order.
   * Add list()/getById() here (matching /api/orders/mine[/:id]) when
   * the Orders and Order Detail pages get wired.
   */
  async getMyOrderCount(): Promise<number> {
    const { data: envelope } = await api.get('/orders/mine', { params: { per_page: 1 } });
    return envelope.meta?.total ?? 0;
  },
};