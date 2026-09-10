/**
 * Quantity-based tiered pricing — the SAME fixed discount rule applies
 * to every product (confirmed directly, not derived from any
 * per-product WooCommerce/plugin data): buy 1 = no extra discount,
 * buy 2–4 = 2% off, buy 5+ = 4% off.
 *
 * This is NOT read from the WooCommerce REST API. The per-product
 * tiered-pricing fields the plugin exposes (`tiered_pricing_fixed_rules`
 * etc.) were empty even for a product with visible tiers on the real
 * website — turns out this rule isn't per-product data at all, it's a
 * single global formula, so there's nothing to fetch.
 *
 * ⚠️ Purely a DISPLAY/preview calculation for the product page, before
 * anything is added to the cart. The actual charged price always comes
 * from WooCommerce's own real cart calculation (see
 * medmeu-app-cart-api.php's medmeu_app_serialize_cart(), which returns
 * the true post-discount price after calculate_totals() runs) — this
 * file has zero influence on what a customer is actually charged. If
 * this preview and the real cart ever disagree, the cart's number is
 * always the one that matters.
 *
 * ⚠️ If this global rule (quantities or percentages) ever changes on
 * the WooCommerce/plugin side, this file needs a matching manual
 * update — same caveat as SHIPPING_WEIGHT_TIERS in CartPage.tsx.
 */

export interface QuantityPricingTier {
  minQty: number;
  discountPercent: number;
  label: string;
}

export const QUANTITY_PRICING_TIERS: QuantityPricingTier[] = [
  { minQty: 1, discountPercent: 0, label: 'Buy 1 piece' },
  { minQty: 2, discountPercent: 2, label: 'Buy 2 pieces and save 2%' },
  { minQty: 5, discountPercent: 4, label: 'Buy 5+ pieces and save 4%' },
];

/** Highest tier a given quantity qualifies for. */
export function getActiveTier(quantity: number): QuantityPricingTier {
  return (
    [...QUANTITY_PRICING_TIERS].reverse().find((t) => quantity >= t.minQty) ??
    QUANTITY_PRICING_TIERS[0]
  );
}

/** Rounded to the nearest rupee, matching how the website displays these. */
export function getTierUnitPrice(basePrice: number, discountPercent: number): number {
  return Math.round(basePrice * (1 - discountPercent / 100));
}