import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonIcon, IonToast, IonSpinner,
} from '@ionic/react';
import {
  closeCircleOutline, chevronForwardOutline, warningOutline,
  checkmarkCircleOutline, informationCircleOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { ordersService, UiOrder } from '../../../services/orders.service';
import './CancelOrder.css';

/* ── Cancellation reasons ── */
const CANCEL_REASONS = [
  { id: 'r1', label: 'Ordered by mistake',         icon: '🤦' },
  { id: 'r2', label: 'Found a better price',        icon: '💰' },
  { id: 'r3', label: 'Delivery time is too long',   icon: '⏱️' },
  { id: 'r4', label: 'Incorrect item ordered',      icon: '📦' },
  { id: 'r5', label: 'Changed my mind',             icon: '🔄' },
  { id: 'r6', label: 'Payment issue',               icon: '💳' },
  { id: 'r7', label: 'Duplicate order placed',      icon: '📋' },
  { id: 'r8', label: 'Other',                       icon: '✏️' },
];

type Step = 'reason' | 'confirm' | 'success';

const CancelOrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const [order, setOrder] = useState<UiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [step, setStep] = useState<Step>('reason');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ordersService
      .getById(id)
      .then((o) => {
        if (cancelled) return;
        // Guard against deep-linking to /order/:id/cancel for an order
        // that can no longer actually be cancelled — the backend would
        // reject it anyway, but catching it here gives a clearer
        // message than a generic API error.
        if (!o.isCancellable) {
          setNotFound(true);
        } else {
          setOrder(o);
        }
      })
      .catch((err) => {
        console.error('Failed to load order', err);
        if (!cancelled) setNotFound(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton /></IonButtons>
            <IonTitle>Cancel Order</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ textAlign: 'center', padding: '80px 24px', color: '#888' }}>
            <IonSpinner name="crescent" />
            <p>Loading order...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (notFound || !order) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton /></IonButtons>
            <IonTitle>Cancel Order</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>📦</div>
            <p style={{ color: '#888' }}>
              This order can't be cancelled — it may already be delivered, cancelled, or no longer exists.
            </p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const selectedReasonObj = CANCEL_REASONS.find(r => r.id === selectedReason);
  const isOther = selectedReason === 'r8';
  const finalReason = isOther
    ? otherText.trim()
    : selectedReasonObj?.label ?? '';
  const isCod = order.paymentMethod === 'cod';

  const handleNext = () => {
    if (!selectedReason) { setError('Please select a reason to continue.'); return; }
    if (isOther && !otherText.trim()) { setError('Please describe your reason.'); return; }
    setError('');
    setStep('confirm');
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    setError('');
    try {
      await ordersService.cancel(order.id, finalReason);
      setStep('success');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Could not cancel this order — please try again.';
      setError(message);
      setStep('reason'); // back to a step where the error is visible
    } finally {
      setCancelling(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            {step === 'confirm' ? (
              <button className="co-back-btn" onClick={() => setStep('reason')}>
                <IonIcon icon={chevronForwardOutline} style={{ transform: 'rotate(180deg)' }} />
              </button>
            ) : (
              <IonBackButton defaultHref={`/order/${id}`} />
            )}
          </IonButtons>
          <IonTitle>
            {step === 'reason' ? 'Cancel Order' : step === 'confirm' ? 'Confirm Cancellation' : 'Order Cancelled'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>

        {/* ════════ STEP 1 — Select reason ════════ */}
        {step === 'reason' && (
          <>
            <div className="co-order-strip">
              <div className="co-order-strip-left">
                <p className="co-strip-id">#{order.orderNumber}</p>
                <p className="co-strip-items">
                  {order.items.map((i) => i.name).join(', ')}
                </p>
              </div>
              <p className="co-strip-total">₹{order.total.toLocaleString()}</p>
            </div>

            <div className="co-info-note">
              <IonIcon icon={informationCircleOutline} />
              <p>
                {isCod
                  ? 'Once cancelled, your order cannot be restored. No refund is applicable for Cash on Delivery orders.'
                  : 'Once cancelled, your order cannot be restored. Refund will be processed within 5–7 business days.'}
              </p>
            </div>

            <p className="co-section-label">Why are you cancelling?</p>
            <div className="co-reasons-list">
              {CANCEL_REASONS.map(reason => {
                const isSelected = selectedReason === reason.id;
                return (
                  <button
                    key={reason.id}
                    className={`co-reason-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => { setSelectedReason(reason.id); setError(''); }}
                  >
                    <span className="co-reason-emoji">{reason.icon}</span>
                    <span className="co-reason-label">{reason.label}</span>
                    <div className={`co-reason-radio ${isSelected ? 'active' : ''}`}>
                      {isSelected && <span className="co-reason-radio-dot" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {isOther && (
              <div className="co-other-wrap">
                <textarea
                  className="co-other-input"
                  placeholder="Please describe your reason (minimum 10 characters)..."
                  value={otherText}
                  rows={4}
                  maxLength={300}
                  onChange={e => { setOtherText(e.target.value); setError(''); }}
                />
                <p className="co-char-count">{otherText.length}/300</p>
              </div>
            )}

            {error && (
              <div className="co-error">
                <IonIcon icon={warningOutline} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ height: 100 }} />
          </>
        )}

        {/* ════════ STEP 2 — Confirm ════════ */}
        {step === 'confirm' && (
          <>
            <div className="co-confirm-wrap">
              <div className="co-confirm-icon">
                <IonIcon icon={closeCircleOutline} />
              </div>
              <h2 className="co-confirm-title">Are you sure?</h2>
              <p className="co-confirm-subtitle">
                You're about to cancel this order. This action cannot be undone.
              </p>

              <div className="co-confirm-card">
                <div className="co-confirm-row">
                  <span>Order ID</span>
                  <strong>#{order.orderNumber}</strong>
                </div>
                <div className="co-confirm-row">
                  <span>Date</span>
                  <strong>{new Date(order.dateCreated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                </div>
                <div className="co-confirm-row">
                  <span>Items</span>
                  <strong>{order.itemCount} item{order.itemCount > 1 ? 's' : ''}</strong>
                </div>
                <div className="co-confirm-row">
                  <span>Total</span>
                  <strong>₹{order.total.toLocaleString()}</strong>
                </div>
                <div className="co-confirm-divider" />
                <div className="co-confirm-row reason-row">
                  <span>Reason</span>
                  <strong className="co-reason-value">{finalReason}</strong>
                </div>
              </div>

              <div className="co-refund-note">
                <span className="co-refund-icon">💰</span>
                <div>
                  <p className="co-refund-title">Refund Policy</p>
                  <p className="co-refund-text">
                    {isCod
                      ? 'This order was placed as Cash on Delivery — no payment was collected, so no refund is applicable.'
                      : `₹${order.total.toLocaleString()} will be refunded to your original payment method within 5–7 business days.`}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ height: 100 }} />
          </>
        )}

        {/* ════════ STEP 3 — Success ════════ */}
        {step === 'success' && (
          <div className="co-success-wrap">
            <div className="co-success-icon">
              <IonIcon icon={checkmarkCircleOutline} />
            </div>
            <h2 className="co-success-title">Order Cancelled</h2>
            <p className="co-success-subtitle">
              Your order #{order.orderNumber} has been successfully cancelled.
            </p>

            <div className="co-success-card">
              <div className="co-success-row">
                <span>Cancellation Reason</span>
                <strong>{finalReason}</strong>
              </div>
              <div className="co-confirm-divider" />
              {!isCod && (
                <div className="co-success-row">
                  <span>Refund Amount</span>
                  <strong className="co-refund-amount">₹{order.total.toLocaleString()}</strong>
                </div>
              )}
              <div className="co-success-row">
                <span>{isCod ? 'Refund' : 'Refund Timeline'}</span>
                <strong>{isCod ? 'Not applicable (COD)' : '5–7 business days'}</strong>
              </div>
            </div>

            <div className="co-success-actions">
              <button className="co-btn-solid" onClick={() => history.push('/tabs/orders')}>
                Back to Orders
              </button>
              <button className="co-btn-outline" onClick={() => history.push('/tabs/home')}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}

      </IonContent>

      {step === 'reason' && (
        <div className="co-bottom-bar">
          <button className="co-btn-outline-sm" onClick={() => history.goBack()}>
            Keep Order
          </button>
          <button className="co-btn-danger" onClick={handleNext}>
            Continue
          </button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="co-bottom-bar">
          <button className="co-btn-outline-sm" onClick={() => setStep('reason')}>
            Go Back
          </button>
          <button className="co-btn-danger" onClick={handleConfirmCancel} disabled={cancelling}>
            {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
          </button>
        </div>
      )}

      <IonToast isOpen={showToast} message="Order cancelled successfully"
        duration={1500} position="bottom" color="danger"
        onDidDismiss={() => setShowToast(false)} />
    </IonPage>
  );
};

export default CancelOrderPage;