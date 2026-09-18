import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonIcon, IonButton, IonSpinner, IonToast,
} from '@ionic/react';
import {
  checkmarkCircle, cartOutline, carOutline,
  cubeOutline, locationOutline, callOutline,
  downloadOutline, starOutline, closeCircleOutline,
  copyOutline,
  cardOutline, cashOutline, phonePortraitOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ordersService, UiOrder, UiOrderStatus } from '../../services/orders.service';
import './OrderDetail.css';

const statusConfig: Record<UiOrderStatus, { color: string; icon: any; label: string; bg: string; text: string }> = {
  delivered:  { color: '#2E7D32', bg: '#E8F5E9', icon: checkmarkCircle,   label: 'Delivered',  text: 'Your order has been delivered successfully.' },
  processing: { color: '#2171a8', bg: '#EEF5FB', icon: cartOutline,       label: 'Processing', text: 'Your order is being prepared.' },
  cancelled:  { color: '#C62828', bg: '#FFEBEE', icon: closeCircleOutline, label: 'Cancelled', text: 'This order has been cancelled.' },
};

/** Best-effort guess at a display icon/label for a raw payment method string — falls back gracefully for anything not explicitly recognized (e.g. a future UPI/card method). */
function paymentDisplay(method: string, title: string) {
  if (method === 'cod') return { icon: cashOutline, label: title || 'Cash on Delivery', sub: 'Pay on delivery' };
  if (method.includes('upi')) return { icon: phonePortraitOutline, label: title || 'UPI', sub: 'Paid online' };
  if (method.includes('card')) return { icon: cardOutline, label: title || 'Card', sub: 'Paid online' };
  return { icon: cashOutline, label: title || method, sub: '' };
}

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { addToCart: persistAddToCart } = useApp();
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState<UiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [buyingAgain, setBuyingAgain] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  /** Same logic as OrdersPage.tsx's buyAgain — see that file for the full reasoning on why each item is added independently. */
  const buyAgain = async () => {
    if (!order) return;
    setBuyingAgain(true);
    let added = 0;
    const failedNames: string[] = [];

    for (const item of order.items) {
      try {
        await persistAddToCart({
          id: String(item.productId),
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          unit: 'unit',
          weight: 0,
        });
        added += 1;
      } catch (err) {
        console.error(`Failed to re-add "${item.name}" to cart`, err);
        failedNames.push(item.name);
      }
    }

    setBuyingAgain(false);

    if (added === 0) {
      setToastMsg('Could not add any items — they may no longer be available.');
      setShowToast(true);
      return;
    }
    if (failedNames.length > 0) {
      setToastMsg(`Added ${added} item${added > 1 ? 's' : ''} to cart. Unavailable: ${failedNames.join(', ')}.`);
      setShowToast(true);
      setTimeout(() => history.push('/tabs/cart'), 1800);
    } else {
      setToastMsg('All items added to cart!');
      setShowToast(true);
      setTimeout(() => history.push('/tabs/cart'), 1200);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    ordersService
      .getById(id)
      .then((o) => { if (!cancelled) setOrder(o); })
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
            <IonButtons slot="start"><IonBackButton defaultHref="/tabs/orders" /></IonButtons>
            <IonTitle>Order Details</IonTitle>
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
            <IonButtons slot="start"><IonBackButton defaultHref="/tabs/orders" /></IonButtons>
            <IonTitle>Order Details</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>📦</div>
            <p style={{ color: '#888', marginTop: 16 }}>Order not found</p>
            <IonButton onClick={() => history.push('/tabs/orders')}>Back to Orders</IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const cfg = statusConfig[order.status];
  const pay = paymentDisplay(order.paymentMethod, order.paymentMethodTitle);

  const copyOrderId = () => {
    navigator.clipboard?.writeText(order.orderNumber).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/tabs/orders" /></IonButtons>
          <IonTitle>Order Details</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>

        {/* ── Status hero banner ── */}
        <div className="od-status-hero" style={{ background: cfg.bg, borderColor: cfg.color + '33' }}>
          <div className="od-status-icon-wrap" style={{ background: cfg.color }}>
            <IonIcon icon={cfg.icon} />
          </div>
          <div className="od-status-text">
            <h2 style={{ color: cfg.color }}>{cfg.label}</h2>
            <p>{cfg.text}</p>
          </div>
        </div>

        {/* ── Order meta card ── */}
        <div className="od-card">
          <div className="od-card-title">Order Information</div>
          <div className="od-meta-row">
            <span className="od-meta-label">Order ID</span>
            <div className="od-meta-value-row">
              <span className="od-meta-value od-order-id">#{order.orderNumber}</span>
              <button className="od-copy-btn" onClick={copyOrderId}>
                <IonIcon icon={copyOutline} />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
          <div className="od-meta-row">
            <span className="od-meta-label">Order Date</span>
            <span className="od-meta-value">
              {new Date(order.dateCreated).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="od-meta-row">
            <span className="od-meta-label">Status</span>
            <span className="od-status-pill" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
          </div>
          {order.status === 'delivered' && order.dateCompleted && (
            <div className="od-meta-row">
              <span className="od-meta-label">Delivered On</span>
              <span className="od-meta-value">
                {new Date(order.dateCompleted).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
          {/* No real "estimated delivery" date — WooCommerce doesn't
              track this natively without a shipment-tracking plugin, so
              this was removed rather than shown as a fabricated guess. */}
        </div>

        {/* ── Items ordered — real line items from the actual order ── */}
        <div className="od-card">
          <div className="od-card-title">
            Items Ordered
            <span className="od-card-title-count">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
          </div>
          {order.items.map((item, i) => (
            <div
              key={item.id}
              className={`od-item-row ${i < order.items.length - 1 ? 'bordered' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => history.push(`/product/${item.productId}`)}
            >
              <div className="od-item-icon">
                {item.image ? (
                  <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <IonIcon icon={cubeOutline} />
                )}
              </div>
              <div className="od-item-info">
                <p className="od-item-name">{item.name}</p>
                <p className="od-item-qty">Qty: {item.quantity}</p>
              </div>
              <div className="od-item-price-col">
                <span className="od-item-price">₹{item.total.toLocaleString()}</span>
                {item.quantity > 1 && (
                  <span className="od-item-unit-price">₹{item.price.toFixed(2)} each</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Simplified real status card — no fabricated timeline.
            WooCommerce only confirms real moments: placed, and (if
            applicable) completed. A genuine "packed/shipped/out for
            delivery" timeline needs a shipment-tracking plugin, which
            hasn't been checked for this store — see orders.service.ts. ── */}
        {order.status !== 'cancelled' && (
          <div className="od-card">
            <div className="od-card-title">Status</div>
            <div className="od-item-row">
              <div className="od-item-icon">
                <IonIcon icon={cartOutline} />
              </div>
              <div className="od-item-info">
                <p className="od-item-name">Order Placed</p>
                <p className="od-item-qty">
                  {new Date(order.dateCreated).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            {order.status === 'delivered' && order.dateCompleted && (
              <div className="od-item-row bordered">
                <div className="od-item-icon">
                  <IonIcon icon={checkmarkCircle} />
                </div>
                <div className="od-item-info">
                  <p className="od-item-name">Delivered</p>
                  <p className="od-item-qty">
                    {new Date(order.dateCompleted).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )}
            {order.status === 'processing' && (
              <div className="od-item-row bordered">
                <div className="od-item-icon">
                  <IonIcon icon={carOutline} />
                </div>
                <div className="od-item-info">
                  <p className="od-item-name">Being Prepared</p>
                  <p className="od-item-qty">We'll update you once it ships.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Delivery address — real, from the order ── */}
        <div className="od-card">
          <div className="od-card-title">Delivery Address</div>
          <div className="od-address-row">
            <div className="od-address-icon">
              <IonIcon icon={locationOutline} />
            </div>
            <div>
              <p className="od-address-name">{order.address.name}</p>
              <p className="od-address-line">
                {order.address.line1}
                {order.address.line2 ? `, ${order.address.line2}` : ''}, {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
              {order.address.phone && <p className="od-address-phone">{order.address.phone}</p>}
            </div>
          </div>
        </div>

        {/* ── Payment summary — real payment method + real shipping total ── */}
        <div className="od-card">
          <div className="od-card-title">Payment Summary</div>
          <div className="od-payment-method-row">
            <IonIcon icon={pay.icon} className="od-pay-icon" />
            <div>
              <p className="od-pay-method-label">{pay.label}</p>
              {pay.sub && <p className="od-pay-method-sub">{pay.sub}</p>}
            </div>
          </div>
          <div className="od-bill">
            <div className="od-bill-row">
              <span>Item Total</span>
              <span>₹{order.itemTotal.toLocaleString()}</span>
            </div>
            <div className="od-bill-row">
              <span>Delivery Fee</span>
              <span>₹{order.shippingTotal.toLocaleString()}</span>
            </div>
            <div className="od-bill-divider" />
            <div className="od-bill-total">
              <span>Total Paid</span>
              <span>₹{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── Action buttons — Invoice/Rate/Support are NOT wired to
            anything real yet, disabled rather than silently broken.
            Buy Again re-adds this order's items to the real cart (see
            buyAgain() above). Cancel is real and gated on the
            backend's own isCancellable check. ── */}
        <div className="od-actions">
          {order.status === 'delivered' && (
            <>
              <button className="od-action-btn outline" disabled title="Coming soon">
                <IonIcon icon={downloadOutline} /> Download Invoice
              </button>
              <button className="od-action-btn outline" disabled title="Coming soon">
                <IonIcon icon={starOutline} /> Rate Products
              </button>
              <button
              className="od-action-btn solid"
              disabled={buyingAgain}
              onClick={buyAgain}
            >
              {buyingAgain ? 'Adding...' : 'Buy Again'}
            </button>
            </>
          )}
          {order.status === 'processing' && (
            <>
              <button className="od-action-btn solid" disabled title="Coming soon">
                <IonIcon icon={callOutline} /> Contact Support
              </button>
              {order.isCancellable && (
                <button className="od-action-btn danger"
                  onClick={() => history.push(`/order/${order.id}/cancel`)}>
                  Cancel Order
                </button>
              )}
            </>
          )}
          {order.status === 'cancelled' && (
            <button
              className="od-action-btn solid"
              disabled={buyingAgain}
              onClick={buyAgain}
            >
              {buyingAgain ? 'Adding...' : 'Buy Again'}
            </button>
          )}
        </div>

        <div style={{ height: 32 }} />
      </IonContent>

      <IonToast
        isOpen={showToast}
        message={toastMsg}
        duration={2000}
        onDidDismiss={() => setShowToast(false)}
        position="bottom"
        color={toastMsg.startsWith('Could not') ? 'danger' : 'success'}
      />
    </IonPage>
  );
};

export default OrderDetailPage;