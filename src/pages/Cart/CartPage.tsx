import React, { useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonIcon, IonToast, IonBackButton, IonButtons,
} from '@ionic/react';
import {
  trashOutline, locationOutline, chevronForward, cardOutline,
  cashOutline, phonePortraitOutline, checkmarkCircle, bagHandleOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Cart.css';

const CartPage: React.FC = () => {
  const history = useHistory();
  const { state, dispatch } = useApp();
  const [showToast, setShowToast] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('cod');
  const [placing, setPlacing] = useState(false);

  const total = state.cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = total >= 499 || total === 0 ? 0 : 49;
  const savings = state.cartItems.reduce((s, i) => s + (i.price * 0.1) * i.quantity, 0);
  const amountToFreeDelivery = 499 - total;

  const updateQty = (id: string, qty: number) => dispatch({ type: 'UPDATE_CART_QTY', payload: { id, quantity: qty } });
  const remove = (id: string) => dispatch({ type: 'REMOVE_FROM_CART', payload: id });

  const placeOrder = async () => {
    setPlacing(true);
    await new Promise(r => setTimeout(r, 900));
    dispatch({ type: 'CLEAR_CART' });
    setPlacing(false);
    setShowToast(true);
    setTimeout(() => history.push('/tabs/orders'), 1400);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/tabs/home" /></IonButtons>
          <IonTitle>My Cart {state.cartCount > 0 ? `(${state.cartCount})` : ''}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {state.cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon-wrap">
              <IonIcon icon={bagHandleOutline} />
            </div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet.<br />Start exploring our products!</p>
            <IonButton className="cart-empty-btn" onClick={() => history.push('/tabs/home')}>
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
                    Add <strong>₹{amountToFreeDelivery}</strong> more to get <strong>FREE delivery</strong>
                  </p>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, (total / 499) * 100)}%` }} />
                  </div>
                </>
              )}
            </div>

            {/* Cart items */}
            <div className="cart-items">
              {state.cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-unit">{item.unit}</p>
                    <div className="cart-qty-row">
                      <div className="cart-qty">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <span className="cart-item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                  <button className="cart-remove-btn" onClick={() => remove(item.id)}>
                    <IonIcon icon={trashOutline} />
                  </button>
                </div>
              ))}
            </div>

            {/* Delivery address */}
            <div className="section-card address-card">
              <div className="card-title-row">
                <div className="card-title-left">
                  <IonIcon icon={locationOutline} className="card-title-icon" />
                  <span>Delivery Address</span>
                </div>
                <button className="change-btn">Change</button>
              </div>
              <div className="address-body">
                <p className="address-name">John Doe <span className="address-tag">Home</span></p>
                <p className="address-text">123, MG Road, Bhubaneswar, Odisha - 751001</p>
                <p className="address-phone">+91 98765 43210</p>
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
                <button className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cod')}>
                  <IonIcon icon={cashOutline} />
                  <div className="payment-option-text">
                    <strong>Cash on Delivery</strong>
                    <span>Pay when your order arrives</span>
                  </div>
                  <span className="radio-dot" />
                </button>
                <button className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`} onClick={() => setPaymentMethod('upi')}>
                  <IonIcon icon={phonePortraitOutline} />
                  <div className="payment-option-text">
                    <strong>UPI / Net Banking</strong>
                    <span>Pay via GPay, PhonePe, Paytm & more</span>
                  </div>
                  <span className="radio-dot" />
                </button>
                <button className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`} onClick={() => setPaymentMethod('card')}>
                  <IonIcon icon={cardOutline} />
                  <div className="payment-option-text">
                    <strong>Credit / Debit Card</strong>
                    <span>Visa, Mastercard, RuPay accepted</span>
                  </div>
                  <span className="radio-dot" />
                </button>
              </div>
            </div>

            {/* Bill summary */}
            <div className="section-card">
              <h3 className="bill-title">Bill Details</h3>
              <div className="bill-row"><span>Item Total ({state.cartCount} items)</span><span>₹{total.toLocaleString()}</span></div>
              <div className="bill-row savings"><span>Discount</span><span>−₹{Math.round(savings)}</span></div>
              <div className="bill-row">
                <span>Delivery Fee</span>
                <span>{delivery === 0 ? <span className="free-tag">FREE</span> : `₹${delivery}`}</span>
              </div>
              <div className="bill-divider" />
              <div className="bill-total-row">
                <span>To Pay</span>
                <span>₹{(total + delivery).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ height: 110 }} />
          </>
        )}

        <IonToast
          isOpen={showToast}
          message="Order placed successfully! 🎉"
          duration={1400}
          position="bottom"
          color="success"
          onDidDismiss={() => setShowToast(false)}
        />
      </IonContent>

      {state.cartItems.length > 0 && (
        <div className="checkout-bar">
          <div className="checkout-amount">
            <span className="checkout-label">Total Amount</span>
            <span className="checkout-total">₹{(total + delivery).toLocaleString()}</span>
          </div>
          <button className="checkout-btn" onClick={placeOrder} disabled={placing}>
            {placing ? 'Placing...' : 'Place Order'}
            {!placing && <IonIcon icon={chevronForward} />}
          </button>
        </div>
      )}
    </IonPage>
  );
};
export default CartPage;