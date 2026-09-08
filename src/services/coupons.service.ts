import api from './api';

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountType: 'percent' | 'fixed_cart' | 'fixed_product';
  discountAmount: number;
  newTotal: number;
}

export interface ValidateCouponInput {
  code: string;
  cartTotal: number;
  cartItems: { product_id: number; quantity: number }[];
}

export const couponsService = {
  /**
   * Backend does the real validation (expiry, usage limit, min/max
   * order amount, product/category restrictions) against WooCommerce's
   * actual coupon — this is NOT a client-side lookup table. Throws on
   * an invalid/expired/ineligible code; the caller is expected to
   * surface err.response?.data?.message, same pattern used everywhere
   * else in this app.
   */
  async validate(input: ValidateCouponInput): Promise<CouponValidationResult> {
    const { data: envelope } = await api.post('/coupons/validate', input);
    return envelope.data;
  },
};