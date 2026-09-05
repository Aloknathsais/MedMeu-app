import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonBackButton,
  IonButtons,
} from "@ionic/react";
import {
  trashOutline,
  locationOutline,
  chevronForward,
  cardOutline,
  cashOutline,
  phonePortraitOutline,
  checkmarkCircle,
  bagHandleOutline,
  pricetagOutline,
  chevronDown,
  addOutline,
  closeOutline,
  homeOutline,
  businessOutline,
  locationSharp,
  pencilOutline,
  trashBinOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { addressesService, Address, AddressInput } from "../../services/addresses.service";
// import OrderConfirmation from "./OrderConfirmation/OrderConfirmation";
import OrderConfirmation from "./OrderConfirmation/OrderConfirmation";
import "./Cart.css";

/* ── Mock promo codes ──
   Still mock — no backend coupon-validation endpoint exists yet
   (see the MedMeu API reference's "Coupons" section: it recommends a
   custom validate-coupon endpoint, which hasn't been built).
   FREESHIP removed: the website's real shipping rule (see
   SHIPPING_WEIGHT_TIERS below) has no free-delivery path at any
   weight or order value — a shipping-type promo would misrepresent
   what the website actually charges. MED10/FLAT50 (item-total
   discounts) don't conflict with that, so they're kept as-is. */
const PROMO_CODES: Record<
  string,
  { type: "percent" | "flat"; value: number; label: string }
> = {
  MED10: { type: "percent", value: 10, label: "10% off on item total" },
  FLAT50: { type: "flat", value: 50, label: "₹50 off on your order" },
};

/**
 * Matches the weight-based shipping rules configured in WooCommerce
 * (Shipping Extensions → Pricing Rules on the live site — see the
 * screenshot this was transcribed from). Tiers are inclusive of their
 * upper bound; a cart's shipping cost is the cost of the first tier
 * whose upTo is >= the cart's total weight.
 *
 * ⚠️ This is a transcription of a screenshot, not a live read of the
 * plugin's config — if the website's rules ever change, this needs to
 * be updated to match by hand, since there's no endpoint currently
 * wired up to read the plugin's actual configured tiers at runtime.
 *
 * ⚠️ No tier covers >20kg — the plugin's own table stops there too.
 * Falling back to the top tier's cost (rather than ₹0) is a safe
 * default, not a real business decision — flag with whoever owns
 * pricing if carts routinely exceed 20kg.
 */
const SHIPPING_WEIGHT_TIERS: { upToKg: number; cost: number }[] = [
  { upToKg: 0.4, cost: 70 },
  { upToKg: 0.8, cost: 120 },
  { upToKg: 1.2, cost: 140 },
  { upToKg: 1.6, cost: 160 },
  { upToKg: 2.0, cost: 190 },
  { upToKg: 20, cost: 220 },
];

function calculateShippingCost(totalWeightKg: number, hasItems: boolean): number {
  if (!hasItems) return 0; // nothing to ship
  if (totalWeightKg <= 0) return SHIPPING_WEIGHT_TIERS[0].cost; // items present but no weight data — fall back to the lowest tier rather than charging ₹0
  const tier = SHIPPING_WEIGHT_TIERS.find((t) => totalWeightKg <= t.upToKg);
  return tier ? tier.cost : SHIPPING_WEIGHT_TIERS[SHIPPING_WEIGHT_TIERS.length - 1].cost;
}

const tagIcon: Record<string, any> = {
  Home: homeOutline,
  Office: businessOutline,
  Other: locationSharp,
};
const getTagIcon = (label?: string) => tagIcon[label ?? ""] ?? locationSharp;

// Shape of the add/edit address form. Mirrors AddressInput from
// addresses.service.ts, plus a UI-only `tag` alias for the backend's
// `label` field (kept as `tag` here so the existing "Home/Office/Other"
// selector below didn't need renaming throughout).
interface AddressFormState {
  name: string;
  tag: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

const EMPTY_FORM: AddressFormState = {
  name: "",
  tag: "Home",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
};

const CartPage: React.FC = () => {
  const history = useHistory();
  const { state, updateCartQty: persistCartQty, removeFromCart: persistRemoveFromCart, clearCart: persistClearCart, loadCart } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi" | "card">(
    "cod",
  );
  const [placing, setPlacing] = useState(false);
  const [orderSummary, setOrderSummary] = useState<{
    orderId: string;
    amount: number;
  } | null>(null);

  // Address state — now backed by the real addresses API instead of
  // MOCK_ADDRESSES. addressesLoading/addressesError cover the initial
  // fetch; addError is specifically for add/edit form submission errors
  // (including backend Zod validation errors surfaced from the API,
  // same pattern as AddressBookPage.tsx).
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  // One shared form for both "add" and "edit" — editingId tells us which
  // mode we're in. (The old code used a full Address for editingAddress,
  // but the real Address type has `label`, not the UI's `tag` field, so
  // a single form-shaped state avoids that mismatch entirely.)
  const [formState, setFormState] = useState<AddressFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addError, setAddError] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

  // Promo state
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");

  const total = state.cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalWeightKg = state.cartItems.reduce(
    (s, i) => s + (i.weight ?? 0) * i.quantity,
    0,
  );
  const delivery = calculateShippingCost(totalWeightKg, state.cartItems.length > 0);
  const savings = state.cartItems.reduce(
    (s, i) => s + i.price * 0.1 * i.quantity,
    0,
  );

  // Minimum order value to place an order at all — applied to the item
  // subtotal (before delivery is added), which is the standard meaning
  // of "minimum order value." If this was meant to apply to the final
  // payable amount (items + delivery) instead, swap `total` for
  // `finalTotal` in both lines below.
  const MIN_ORDER_VALUE = 2000;
  const meetsMinOrder = state.cartItems.length === 0 || total >= MIN_ORDER_VALUE;
  const amountToMinOrder = MIN_ORDER_VALUE - total;

  const activePromo = promoCode ? PROMO_CODES[promoCode] : null;
  const promoDiscount =
    activePromo?.type === "percent"
      ? Math.round((total * activePromo.value) / 100)
      : activePromo?.type === "flat"
      ? Math.min(activePromo.value, total)
      : 0;
  // Shipping is never discounted or waived — no promo type here
  // reduces it, matching "no free delivery" as a hard rule rather
  // than something a promo code could override.
  const finalTotal = total + delivery - promoDiscount;

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];

  // Loads the customer's real saved addresses on mount, and preselects
  // whichever one is marked default (falling back to the first) —
  // mirrors how AddressBookPage.tsx treats isDefault as the source of
  // truth rather than "whatever was selected last time" local state.
  useEffect(() => {
    let cancelled = false;
    setAddressesLoading(true);
    setAddressesError("");
    addressesService
      .list()
      .then((list) => {
        if (cancelled) return;
        setAddresses(list);
        const preferred = list.find((a) => a.isDefault) ?? list[0];
        if (preferred) setSelectedAddressId(preferred.id);
      })
      .catch((err) => {
        console.error("Failed to load addresses", err);
        if (!cancelled) setAddressesError("Could not load your saved addresses.");
      })
      .finally(() => {
        if (!cancelled) setAddressesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (!PROMO_CODES[code]) {
      setPromoError("Invalid or expired promo code");
      return;
    }
    setPromoCode(code);
    setPromoError("");
    setPromoOpen(false);
  };

  const removePromo = () => {
    setPromoCode(null);
    setPromoInput("");
    setPromoError("");
  };

  // Load the customer's persisted cart from the backend on mount, rather
  // than relying on whatever (session-only) state happened to already be
  // in AppContext — matches the same "server is the source of truth"
  // approach used for addresses.
  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Both of these now call the backend first and only update local state
  // with what the server actually confirmed — see AppContext.tsx for why
  // (a request "succeeding" isn't the same as the change being persisted).
  // TODO: surface a toast on failure here, matching the pattern already
  // used in AddressBookPage.tsx for backend Zod/validation errors, once
  // this page has a toast helper wired in.
  const updateQty = (id: string, qty: number) => {
    persistCartQty(id, qty).catch((err) => {
      console.error("Failed to update cart quantity", err);
    });
  };
  const remove = (id: string) => {
    persistRemoveFromCart(id).catch((err) => {
      console.error("Failed to remove cart item", err);
    });
  };

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    setShowAddressSheet(false);
    setShowAddForm(false);
  };

  const handleSaveAddress = async () => {
    const { name, line1, city, state: st, pincode, phone } = formState;
    if (!name || !line1 || !city || !st || !pincode || !phone) {
      setAddError("Please fill all required fields");
      return;
    }
    if (phone.replace(/\D/g, "").length < 6) {
      setAddError("Enter a valid phone number");
      return;
    }

    const input: AddressInput = {
      label: formState.tag,
      name,
      phone,
      line1,
      line2: formState.line2 || undefined,
      city,
      state: st,
      pincode,
      country: "IN",
    };

    setSavingAddress(true);
    setAddError("");
    try {
      if (editingId) {
        const updated = await addressesService.update(editingId, input);
        setAddresses((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
      } else {
        const created = await addressesService.create(input);
        setAddresses((prev) => [...prev, created]);
        setSelectedAddressId(created.id);
      }
      setFormState(EMPTY_FORM);
      setEditingId(null);
      setShowAddForm(false);
      setShowAddressSheet(false);
    } catch (err: any) {
      // Surface the backend's real Zod validation message when there is
      // one, instead of a generic failure — same pattern as
      // AddressBookPage.tsx.
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.details?.[0]?.message ||
        "Could not save this address — please try again.";
      setAddError(message);
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      // Backend returns the remaining list, including any address it
      // auto-promoted to default after this deletion — use that as the
      // source of truth rather than filtering locally.
      const remaining = await addressesService.remove(id);
      setAddresses(remaining);
      if (selectedAddressId === id) {
        const preferred = remaining.find((a) => a.isDefault) ?? remaining[0];
        setSelectedAddressId(preferred?.id ?? "");
      }
    } catch (err) {
      console.error("Failed to delete address", err);
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const startEdit = (addr: Address, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormState({
      name: addr.name,
      tag: addr.label || "Other",
      line1: addr.line1,
      line2: addr.line2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      phone: addr.phone,
    });
    setEditingId(addr.id);
    setShowAddForm(true);
    setAddError("");
  };

  const updateForm =
    (field: keyof AddressFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));

  // ⚠️ Still fully mocked — a fake 900ms delay and a client-generated
  // orderId, no real call to the checkout endpoint your API reference
  // already documents (POST /api/orders/checkout). This wasn't part of
  // the cart-persistence work, but it's the next real gap: right now
  // "placing an order" doesn't create anything in WooCommerce at all,
  // it just clears the (now real) cart and shows a fake confirmation.
  const placeOrder = async () => {
    if (!meetsMinOrder || !selectedAddress) return;
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 900));
    const orderId = `MED${Date.now().toString().slice(-8)}`;
    setOrderSummary({ orderId, amount: finalTotal });
    try {
      await persistClearCart();
    } catch (err) {
      console.error("Failed to clear cart after order", err);
    }
    setPlacing(false);
  };

  const handleConfirmationFinish = () => {
    setOrderSummary(null);
    history.push("/tabs/orders");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/home" />
          </IonButtons>
          <IonTitle>
            My Cart {state.cartCount > 0 ? `(${state.cartCount})` : ""}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {state.cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon-wrap">
              <IonIcon icon={bagHandleOutline} />
            </div>
            <h3>Your cart is empty</h3>
            <p>
              Looks like you haven't added anything yet.
              <br />
              Start exploring our products!
            </p>
            <IonButton
              className="cart-empty-btn"
              onClick={() => history.push("/tabs/home")}
            >
              Start Shopping
            </IonButton>
          </div>
        ) : (
          <>
            {/* Shipping is always charged, by cart weight — no free-
                delivery threshold exists on the real website (see
                SHIPPING_WEIGHT_TIERS above), so this replaces what used
                to be a "spend ₹X more for free delivery" progress bar. */}
            <div className="delivery-progress-card">
              <p className="delivery-progress-text">
                Delivery charge: <strong>₹{delivery}</strong> (based on{" "}
                {totalWeightKg.toFixed(2)} kg)
              </p>
            </div>

            {/* Minimum order value — checkout stays disabled below this,
                so this needs to be visible wherever the user is looking,
                not just as a disabled-button tooltip. */}
            {!meetsMinOrder && (
              <div className="delivery-progress-card" style={{ borderColor: "#C62828" }}>
                <p className="delivery-progress-text" style={{ color: "#C62828" }}>
                  Minimum order value is <strong>₹{MIN_ORDER_VALUE}</strong>.
                  Add <strong>₹{amountToMinOrder}</strong> more to place this
                  order.
                </p>
              </div>
            )}

            {/* Cart items */}
            <div className="cart-items">
              {state.cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-unit">{item.unit}</p>
                    <div className="cart-qty-row">
                      <div className="cart-qty">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="cart-item-price">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    className="cart-remove-btn"
                    onClick={() => remove(item.id)}
                  >
                    <IonIcon icon={trashOutline} />
                  </button>
                </div>
              ))}
            </div>

            {/* ── Delivery address ── */}
            <div className="section-card address-card">
              <div className="card-title-row">
                <div className="card-title-left">
                  <IonIcon icon={locationOutline} className="card-title-icon" />
                  <span>Delivery Address</span>
                </div>
                {!addressesLoading && selectedAddress && (
                  <button
                    className="change-btn"
                    onClick={() => {
                      setShowAddressSheet(true);
                      setShowAddForm(false);
                    }}
                  >
                    Change
                  </button>
                )}
              </div>
              {addressesLoading ? (
                <p className="address-text">Loading your addresses…</p>
              ) : addressesError ? (
                <p className="address-text" style={{ color: "#C62828" }}>
                  {addressesError}
                </p>
              ) : selectedAddress ? (
                <div className="address-body">
                  <p className="address-name">
                    {selectedAddress.name}
                    {selectedAddress.label && (
                      <span className="address-tag">{selectedAddress.label}</span>
                    )}
                  </p>
                  <p className="address-text">
                    {selectedAddress.line1}
                    {selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""},{" "}
                    {selectedAddress.city}, {selectedAddress.state} -{" "}
                    {selectedAddress.pincode}
                  </p>
                  <p className="address-phone">{selectedAddress.phone}</p>
                </div>
              ) : (
                <div className="address-body">
                  <p className="address-text">
                    You don't have a saved delivery address yet.
                  </p>
                  <button
                    className="change-btn"
                    onClick={() => {
                      setFormState(EMPTY_FORM);
                      setEditingId(null);
                      setShowAddForm(true);
                      setShowAddressSheet(true);
                      setAddError("");
                    }}
                  >
                    Add Address
                  </button>
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="section-card">
              <div className="card-title-row">
                <div className="card-title-left">
                  <IonIcon icon={cardOutline} className="card-title-icon" />
                  <span>Payment Method</span>
                </div>
              </div>
              <div className="payment-options">
                {[
                  {
                    id: "cod",
                    icon: cashOutline,
                    title: "Cash on Delivery",
                    sub: "Pay when your order arrives",
                  },
                  {
                    id: "upi",
                    icon: phonePortraitOutline,
                    title: "UPI / Net Banking",
                    sub: "Pay via GPay, PhonePe, Paytm & more",
                  },
                  {
                    id: "card",
                    icon: cardOutline,
                    title: "Credit / Debit Card",
                    sub: "Visa, Mastercard, RuPay accepted",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    className={`payment-option ${
                      paymentMethod === opt.id ? "selected" : ""
                    }`}
                    onClick={() => setPaymentMethod(opt.id as any)}
                  >
                    <IonIcon icon={opt.icon} />
                    <div className="payment-option-text">
                      <strong>{opt.title}</strong>
                      <span>{opt.sub}</span>
                    </div>
                    <span className="radio-dot" />
                  </button>
                ))}
              </div>
            </div>

            {/* Bill summary */}
            <div className="section-card">
              <h3 className="bill-title">Bill Details</h3>
              <div className="bill-row">
                <span>Item Total ({state.cartCount} items)</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="bill-row savings">
                <span>Discount</span>
                <span>−₹{Math.round(savings)}</span>
              </div>
              <div className="bill-row">
                <span>Delivery Fee</span>
                <span>₹{delivery}</span>
              </div>
              <div className="bill-divider" />
              <div className="promo-section">
                {!promoCode ? (
                  <>
                    <button
                      className="promo-toggle"
                      onClick={() => setPromoOpen((o) => !o)}
                    >
                      <span className="promo-toggle-left">
                        <IonIcon icon={pricetagOutline} />I have a promo code
                      </span>
                      <IonIcon
                        icon={chevronDown}
                        className={`promo-chevron ${promoOpen ? "open" : ""}`}
                      />
                    </button>
                    {promoOpen && (
                      <div className="promo-input-wrap">
                        <div className="promo-input-row">
                          <input
                            type="text"
                            className="promo-input"
                            placeholder="Enter promo code"
                            value={promoInput}
                            onChange={(e) => {
                              setPromoInput(e.target.value);
                              setPromoError("");
                            }}
                          />
                          <button
                            className="promo-apply-btn"
                            onClick={applyPromo}
                            disabled={!promoInput.trim()}
                          >
                            Apply
                          </button>
                        </div>
                        {promoError && (
                          <p className="promo-error">{promoError}</p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="promo-applied">
                    <div className="promo-applied-left">
                      <IonIcon
                        icon={pricetagOutline}
                        className="promo-applied-icon"
                      />
                      <div className="promo-applied-text">
                        <strong>{promoCode} applied</strong>
                        <span>{activePromo?.label}</span>
                      </div>
                    </div>
                    <button className="promo-remove-btn" onClick={removePromo}>
                      Remove
                    </button>
                  </div>
                )}
              </div>
              {promoCode && promoDiscount > 0 && (
                <div className="bill-row savings">
                  <span>Promo ({promoCode})</span>
                  <span>−₹{promoDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="bill-divider" />
              <div className="bill-total-row">
                <span>To Pay</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ height: 110 }} />
          </>
        )}

      </IonContent>

      <OrderConfirmation
        isOpen={!!orderSummary}
        amount={orderSummary?.amount ?? 0}
        orderId={orderSummary?.orderId ?? ""}
        onFinish={handleConfirmationFinish}
      />

      {state.cartItems.length > 0 && (
        <div className="checkout-bar">
          <div className="checkout-amount">
            <span className="checkout-label">Total Amount</span>
            <span className="checkout-total">
              ₹{finalTotal.toLocaleString()}
            </span>
          </div>
          <button
            className="checkout-btn"
            onClick={placeOrder}
            disabled={placing || !selectedAddress || !meetsMinOrder}
          >
            {placing ? "Placing..." : "Place Order"}
            {!placing && <IonIcon icon={chevronForward} />}
          </button>
        </div>
      )}

      {/* ════════ Address Bottom Sheet ════════ */}
      {showAddressSheet && (
        <div
          className="addr-sheet-overlay"
          onClick={() => {
            setShowAddressSheet(false);
            setShowAddForm(false);
            setEditingId(null);
            setAddError("");
          }}
        >
          <div
            className="addr-sheet-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="addr-sheet-handle" />

            <div className="addr-sheet-header">
              <h3>
                {showAddForm
                  ? editingId
                    ? "Edit Address"
                    : "Add New Address"
                  : "Select Delivery Address"}
              </h3>
              <button
                className="addr-sheet-close"
                onClick={() => {
                  setShowAddressSheet(false);
                  setShowAddForm(false);
                  setEditingId(null);
                  setAddError("");
                }}
              >
                <IonIcon icon={closeOutline} />
              </button>
            </div>

            {/* ── Address list ── */}
            {!showAddForm && (
              <>
                <div className="addr-list">
                  {addresses.map((addr) => {
                    const isSelected = addr.id === selectedAddressId;
                    const isConfirmingDelete = showDeleteConfirm === addr.id;
                    return (
                      <div
                        key={addr.id}
                        className={`addr-item-wrap ${
                          isSelected ? "selected" : ""
                        }`}
                      >
                        {/* Floating edit / delete icon buttons */}
                        {!isConfirmingDelete && (
                          <div className="addr-floating-actions">
                            <button
                              className="addr-fab edit"
                              onClick={(e) => startEdit(addr, e)}
                              aria-label="Edit address"
                            >
                              <IonIcon icon={pencilOutline} />
                            </button>
                            <button
                              className="addr-fab delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(addr.id);
                              }}
                              aria-label="Delete address"
                            >
                              <IonIcon icon={trashBinOutline} />
                            </button>
                          </div>
                        )}

                        {/* Main selectable row */}
                        <button
                          className="addr-item"
                          onClick={() => handleSelectAddress(addr.id)}
                        >
                          <div
                            className={`addr-radio ${
                              isSelected ? "active" : ""
                            }`}
                          >
                            {isSelected && <span className="addr-radio-dot" />}
                          </div>
                          <div className="addr-item-body">
                            <div className="addr-item-top">
                              <IonIcon
                                icon={getTagIcon(addr.label)}
                                className="addr-tag-icon"
                              />
                              {addr.label && (
                                <span
                                  className={`addr-tag-chip ${addr.label.toLowerCase()}`}
                                >
                                  {addr.label}
                                </span>
                              )}
                              <span className="addr-item-name">
                                {addr.name}
                              </span>
                              {addr.isDefault && (
                                <span className="addr-tag-chip default">Default</span>
                              )}
                            </div>
                            <p className="addr-item-line">
                              {addr.line1}
                              {addr.line2 ? `, ${addr.line2}` : ""}
                            </p>
                            <p className="addr-item-line">
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="addr-item-phone">{addr.phone}</p>
                          </div>
                          {isSelected && (
                            <IonIcon
                              icon={checkmarkCircle}
                              className="addr-selected-check"
                            />
                          )}
                        </button>

                        {/* Confirm delete inline */}
                        {isConfirmingDelete && (
                          <div className="addr-delete-confirm">
                            <p>Remove this address?</p>
                            <div className="addr-delete-btns">
                              <button
                                className="addr-del-cancel"
                                onClick={() => setShowDeleteConfirm(null)}
                              >
                                Cancel
                              </button>
                              <button
                                className="addr-del-confirm"
                                onClick={() => handleDeleteAddress(addr.id)}
                              >
                                Yes, Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  className="addr-add-new-btn"
                  onClick={() => {
                    setEditingId(null);
                    setFormState(EMPTY_FORM);
                    setShowAddForm(true);
                    setAddError("");
                  }}
                >
                  <IonIcon icon={addOutline} />
                  Add New Address
                </button>
              </>
            )}

            {/* ── Add / Edit form ── */}
            {showAddForm && (
              <div className="addr-form">
                <div className="addr-form-group">
                  <label>
                    Full Name <span className="addr-required">*</span>
                  </label>
                  <input
                    className="addr-input"
                    placeholder="Enter full name"
                    value={formState.name}
                    onChange={updateForm("name")}
                  />
                </div>
                <div className="addr-form-group">
                  <label>
                    Address Type <span className="addr-required">*</span>
                  </label>
                  <div className="addr-tag-selector">
                    {["Home", "Office", "Other"].map((tag) => {
                      const isActive = formState.tag === tag;
                      return (
                        <button
                          key={tag}
                          className={`addr-tag-opt ${isActive ? "active" : ""}`}
                          onClick={() =>
                            setFormState((p) => ({ ...p, tag }))
                          }
                        >
                          <IonIcon icon={tagIcon[tag]} />
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="addr-form-group">
                  <label>
                    House / Flat / Building{" "}
                    <span className="addr-required">*</span>
                  </label>
                  <input
                    className="addr-input"
                    placeholder="Enter address line 1"
                    value={formState.line1}
                    onChange={updateForm("line1")}
                  />
                </div>
                <div className="addr-form-group">
                  <label>Area / Street (optional)</label>
                  <input
                    className="addr-input"
                    placeholder="Enter area or street"
                    value={formState.line2}
                    onChange={updateForm("line2")}
                  />
                </div>
                {/* Real, editable City and State fields — the backend's
                    validator requires both as non-empty, separate fields
                    (same requirement AddressBookPage.tsx's form has to
                    satisfy), so these can't be derived/parsed from line2. */}
                <div className="addr-form-row">
                  <div className="addr-form-group half">
                    <label>
                      City <span className="addr-required">*</span>
                    </label>
                    <input
                      className="addr-input"
                      placeholder="City"
                      value={formState.city}
                      onChange={updateForm("city")}
                    />
                  </div>
                  <div className="addr-form-group half">
                    <label>
                      State <span className="addr-required">*</span>
                    </label>
                    <input
                      className="addr-input"
                      placeholder="State"
                      value={formState.state}
                      onChange={updateForm("state")}
                    />
                  </div>
                </div>
                <div className="addr-form-row">
                  <div className="addr-form-group half">
                    <label>
                      Pincode <span className="addr-required">*</span>
                    </label>
                    <input
                      className="addr-input"
                      placeholder="6-digit pincode"
                      type="number"
                      value={formState.pincode}
                      onChange={updateForm("pincode")}
                    />
                  </div>
                  <div className="addr-form-group half">
                    <label>
                      Phone <span className="addr-required">*</span>
                    </label>
                    <input
                      className="addr-input"
                      placeholder="Mobile number"
                      type="tel"
                      value={formState.phone}
                      onChange={updateForm("phone")}
                    />
                  </div>
                </div>
                {addError && <p className="addr-form-error">{addError}</p>}
                <div className="addr-form-actions">
                  <button
                    className="addr-cancel-btn"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                      setAddError("");
                    }}
                  >
                    Back
                  </button>
                  <button
                    className="addr-save-btn"
                    onClick={handleSaveAddress}
                    disabled={savingAddress}
                  >
                    {savingAddress
                      ? "Saving..."
                      : editingId
                      ? "Save Changes"
                      : "Save & Use"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </IonPage>
  );
};
export default CartPage;