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
// import OrderConfirmation from "./OrderConfirmation/OrderConfirmation";
import OrderConfirmation from "./OrderConfirmation/OrderConfirmation";
import "./Cart.css";

/* ── Mock promo codes ── */
const PROMO_CODES: Record<
  string,
  { type: "percent" | "flat" | "shipping"; value: number; label: string }
> = {
  MED10: { type: "percent", value: 10, label: "10% off on item total" },
  FLAT50: { type: "flat", value: 50, label: "₹50 off on your order" },
  FREESHIP: {
    type: "shipping",
    value: 0,
    label: "Free delivery on this order",
  },
};

/* ── Mock addresses ── */
interface Address {
  id: string;
  name: string;
  tag: "Home" | "Office" | "Other";
  line1: string;
  line2: string;
  pincode: string;
  phone: string;
}

const MOCK_ADDRESSES: Address[] = [
  {
    id: "addr1",
    name: "John Doe",
    tag: "Home",
    line1: "123, MG Road",
    line2: "Bhubaneswar, Odisha",
    pincode: "751001",
    phone: "+91 98765 43210",
  },
  {
    id: "addr2",
    name: "John Doe",
    tag: "Office",
    line1: "45, Janpath Tower, 3rd Floor",
    line2: "Saheed Nagar, Bhubaneswar, Odisha",
    pincode: "751007",
    phone: "+91 98765 43210",
  },
  {
    id: "addr3",
    name: "John Doe",
    tag: "Other",
    line1: "8, New Colony, Near AIIMS",
    line2: "Patrapada, Bhubaneswar, Odisha",
    pincode: "751019",
    phone: "+91 98765 43210",
  },
];

const tagIcon: Record<string, any> = {
  Home: homeOutline,
  Office: businessOutline,
  Other: locationSharp,
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

  // Address state
  const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("addr1");
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    tag: "Home",
    line1: "",
    line2: "",
    pincode: "",
    phone: "",
  });
  const [addError, setAddError] = useState("");
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

  // Promo state
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");

  const total = state.cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = total >= 499 || total === 0 ? 0 : 49;
  const savings = state.cartItems.reduce(
    (s, i) => s + i.price * 0.1 * i.quantity,
    0,
  );
  const amountToFreeDelivery = 499 - total;

  const activePromo = promoCode ? PROMO_CODES[promoCode] : null;
  const finalDelivery = activePromo?.type === "shipping" ? 0 : delivery;
  const promoDiscount =
    activePromo?.type === "percent"
      ? Math.round((total * activePromo.value) / 100)
      : activePromo?.type === "flat"
      ? Math.min(activePromo.value, total)
      : 0;
  const finalTotal = total + finalDelivery - promoDiscount;

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];

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

  const handleSaveAddress = () => {
    const { name, line1, pincode, phone } = editingAddress
      ? editingAddress
      : newAddress;
    if (!name || !line1 || !pincode || !phone) {
      setAddError("Please fill all required fields");
      return;
    }
    if (pincode.length !== 6) {
      setAddError("Enter a valid 6-digit pincode");
      return;
    }

    if (editingAddress) {
      // Update existing
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingAddress.id ? editingAddress : a)),
      );
      setEditingAddress(null);
    } else {
      // Add new
      const id = `addr${Date.now()}`;
      const addr: Address = {
        id,
        ...newAddress,
        tag: newAddress.tag as Address["tag"],
      };
      setAddresses((prev) => [...prev, addr]);
      setSelectedAddressId(id);
      setNewAddress({
        name: "",
        tag: "Home",
        line1: "",
        line2: "",
        pincode: "",
        phone: "",
      });
    }
    setShowAddForm(false);
    setShowAddressSheet(false);
    setAddError("");
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedAddressId === id) {
      const remaining = addresses.filter((a) => a.id !== id);
      setSelectedAddressId(remaining[0]?.id ?? "");
    }
    setShowDeleteConfirm(null);
  };

  const startEdit = (addr: Address, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddress({ ...addr });
    setShowAddForm(true);
    setAddError("");
  };

  const updateEdit =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setEditingAddress((prev) =>
        prev ? { ...prev, [field]: e.target.value } : prev,
      );

  // ⚠️ Still fully mocked — a fake 900ms delay and a client-generated
  // orderId, no real call to the checkout endpoint your API reference
  // already documents (POST /api/orders/checkout). This wasn't part of
  // the cart-persistence work, but it's the next real gap: right now
  // "placing an order" doesn't create anything in WooCommerce at all,
  // it just clears the (now real) cart and shows a fake confirmation.
  const placeOrder = async () => {
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

  const updateNew =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setNewAddress((p) => ({ ...p, [field]: e.target.value }));

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
            {/* Free delivery progress */}
            <div className="delivery-progress-card">
              {delivery === 0 ? (
                <div className="delivery-success">
                  <IonIcon icon={checkmarkCircle} />
                  <span>You've unlocked FREE delivery on this order!</span>
                </div>
              ) : (
                <>
                  <p className="delivery-progress-text">
                    Add <strong>₹{amountToFreeDelivery}</strong> more to get{" "}
                    <strong>FREE delivery</strong>
                  </p>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(100, (total / 499) * 100)}%`,
                      }}
                    />
                  </div>
                </>
              )}
            </div>

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
                <button
                  className="change-btn"
                  onClick={() => {
                    setShowAddressSheet(true);
                    setShowAddForm(false);
                  }}
                >
                  Change
                </button>
              </div>
              <div className="address-body">
                <p className="address-name">
                  {selectedAddress.name}
                  <span className="address-tag">{selectedAddress.tag}</span>
                </p>
                <p className="address-text">
                  {selectedAddress.line1}, {selectedAddress.line2} -{" "}
                  {selectedAddress.pincode}
                </p>
                <p className="address-phone">{selectedAddress.phone}</p>
              </div>
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
                <span>
                  {finalDelivery === 0 ? (
                    <span className="free-tag">FREE</span>
                  ) : (
                    `₹${finalDelivery}`
                  )}
                </span>
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
            disabled={placing}
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
            setEditingAddress(null);
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
                  ? editingAddress
                    ? "Edit Address"
                    : "Add New Address"
                  : "Select Delivery Address"}
              </h3>
              <button
                className="addr-sheet-close"
                onClick={() => {
                  setShowAddressSheet(false);
                  setShowAddForm(false);
                  setEditingAddress(null);
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
                                icon={tagIcon[addr.tag]}
                                className="addr-tag-icon"
                              />
                              <span
                                className={`addr-tag-chip ${addr.tag.toLowerCase()}`}
                              >
                                {addr.tag}
                              </span>
                              <span className="addr-item-name">
                                {addr.name}
                              </span>
                            </div>
                            <p className="addr-item-line">
                              {addr.line1}, {addr.line2}
                            </p>
                            <p className="addr-item-line">{addr.pincode}</p>
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
                    setEditingAddress(null);
                    setNewAddress({
                      name: "",
                      tag: "Home",
                      line1: "",
                      line2: "",
                      pincode: "",
                      phone: "",
                    });
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
                    value={
                      editingAddress ? editingAddress.name : newAddress.name
                    }
                    onChange={
                      editingAddress ? updateEdit("name") : updateNew("name")
                    }
                  />
                </div>
                <div className="addr-form-group">
                  <label>
                    Address Type <span className="addr-required">*</span>
                  </label>
                  <div className="addr-tag-selector">
                    {["Home", "Office", "Other"].map((tag) => {
                      const isActive = editingAddress
                        ? editingAddress.tag === tag
                        : newAddress.tag === tag;
                      return (
                        <button
                          key={tag}
                          className={`addr-tag-opt ${isActive ? "active" : ""}`}
                          onClick={() => {
                            if (editingAddress)
                              setEditingAddress((p) =>
                                p ? { ...p, tag: tag as Address["tag"] } : p,
                              );
                            else setNewAddress((p) => ({ ...p, tag }));
                          }}
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
                    value={
                      editingAddress ? editingAddress.line1 : newAddress.line1
                    }
                    onChange={
                      editingAddress ? updateEdit("line1") : updateNew("line1")
                    }
                  />
                </div>
                <div className="addr-form-group">
                  <label>Area / Street / City</label>
                  <input
                    className="addr-input"
                    placeholder="Enter address line 2"
                    value={
                      editingAddress ? editingAddress.line2 : newAddress.line2
                    }
                    onChange={
                      editingAddress ? updateEdit("line2") : updateNew("line2")
                    }
                  />
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
                      value={
                        editingAddress
                          ? editingAddress.pincode
                          : newAddress.pincode
                      }
                      onChange={
                        editingAddress
                          ? updateEdit("pincode")
                          : updateNew("pincode")
                      }
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
                      value={
                        editingAddress ? editingAddress.phone : newAddress.phone
                      }
                      onChange={
                        editingAddress
                          ? updateEdit("phone")
                          : updateNew("phone")
                      }
                    />
                  </div>
                </div>
                {addError && <p className="addr-form-error">{addError}</p>}
                <div className="addr-form-actions">
                  <button
                    className="addr-cancel-btn"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingAddress(null);
                      setAddError("");
                    }}
                  >
                    Back
                  </button>
                  <button className="addr-save-btn" onClick={handleSaveAddress}>
                    {editingAddress ? "Save Changes" : "Save & Use"}
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