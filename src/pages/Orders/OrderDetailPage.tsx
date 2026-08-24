import React, { useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonIcon, IonButton,
} from '@ionic/react';
import {
  checkmarkCircle, cartOutline, businessOutline, homeOutline,
  carOutline, cubeOutline, locationOutline, callOutline,
  downloadOutline, starOutline, closeCircleOutline,
  chevronDownOutline, chevronUpOutline, copyOutline,
  cardOutline, cashOutline, phonePortraitOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { mockOrders } from '../../utils/mockData';
import './OrderDetail.css';

/* ── Status config ── */
const statusConfig: Record<string, { color: string; icon: any; label: string; bg: string; text: string }> = {
  Delivered:    { color: '#2E7D32', bg: '#E8F5E9', icon: checkmarkCircle,   label: 'Delivered',   text: 'Your order has been delivered successfully.' },
  'In Transit': { color: '#f4621d', bg: '#FFF3E0', icon: carOutline,        label: 'In Transit',  text: 'Your order is out for delivery.' },
  Processing:   { color: '#2171a8', bg: '#EEF5FB', icon: cartOutline,       label: 'Processing',  text: 'Your order is being prepared by the seller.' },
  Cancelled:    { color: '#C62828', bg: '#FFEBEE', icon: closeCircleOutline, label: 'Cancelled',  text: 'This order has been cancelled.' },
};

/* ── Build timeline steps ── */
const buildSteps = (order: any) => [
  {
    key: 'placed', label: 'Order Placed', icon: cartOutline,
    description: `Order #${order.id} placed successfully.`,
    time: new Date(order.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    done: true,
  },
  {
    key: 'confirmed', label: 'Confirmed', icon: checkmarkCircle,
    description: 'Seller confirmed and is preparing your order.',
    time: order.status !== 'Processing' && order.status !== 'Cancelled'
      ? new Date(new Date(order.date).getTime() + 2 * 3600000).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : undefined,
    done: order.status !== 'Processing' && order.status !== 'Cancelled',
  },
  {
    key: 'packed', label: 'Packed & Ready', icon: businessOutline,
    description: 'Items packed and handed to delivery partner.',
    time: order.status === 'In Transit' || order.status === 'Delivered'
      ? new Date(new Date(order.date).getTime() + 26 * 3600000).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : undefined,
    done: order.status === 'In Transit' || order.status === 'Delivered',
  },
  {
    key: 'shipped', label: 'Out for Delivery', icon: carOutline,
    description: 'Delivery partner is on the way to your address.',
    time: order.status === 'In Transit' || order.status === 'Delivered'
      ? new Date(new Date(order.date).getTime() + 28 * 3600000).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : undefined,
    done: order.status === 'In Transit' || order.status === 'Delivered',
  },
  {
    key: 'delivered', label: 'Delivered', icon: homeOutline,
    description: 'Order delivered. Enjoy your purchase!',
    time: order.status === 'Delivered'
      ? new Date(new Date(order.date).getTime() + 30 * 3600000).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : undefined,
    done: order.status === 'Delivered',
  },
];

const currentStepIndex = (status: string) => {
  if (status === 'Processing')   return 1;
  if (status === 'In Transit')   return 3;
  if (status === 'Delivered')    return 4;
  return 0;
};

const paymentIcon: Record<string, any> = {
  COD: cashOutline, UPI: phonePortraitOutline, Card: cardOutline,
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [trackOpen, setTrackOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const order = mockOrders.find(o => o.id === id);

  if (!order) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton /></IonButtons>
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

  const cfg = statusConfig[order.status] ?? statusConfig.Processing;
  const steps = buildSteps(order);
  const currentIdx = currentStepIndex(order.status);
  const total = order.items.reduce((s: number, i: any) => s + i.price * i.qty, 0);
  const delivery = total >= 499 ? 0 : 49;
  const payMethod = (order as any).paymentMethod ?? 'COD';

  const copyOrderId = () => {
    navigator.clipboard?.writeText(order.id).catch(() => {});
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
              <span className="od-meta-value od-order-id">#{order.id}</span>
              <button className="od-copy-btn" onClick={copyOrderId}>
                <IonIcon icon={copyOutline} />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
          <div className="od-meta-row">
            <span className="od-meta-label">Order Date</span>
            <span className="od-meta-value">
              {new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="od-meta-row">
            <span className="od-meta-label">Status</span>
            <span className="od-status-pill" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
          </div>
          {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
            <div className="od-meta-row">
              <span className="od-meta-label">Est. Delivery</span>
              <span className="od-meta-value od-est-date">
                {new Date(new Date(order.date).getTime() + 30 * 3600000)
                  .toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        {/* ── Items ordered ── */}
        <div className="od-card">
          <div className="od-card-title">
            Items Ordered
            <span className="od-card-title-count">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
          </div>
          {order.items.map((item: any, i: number) => (
            <div key={i} className={`od-item-row ${i < order.items.length - 1 ? 'bordered' : ''}`}>
              <div className="od-item-icon">
                <IonIcon icon={cubeOutline} />
              </div>
              <div className="od-item-info">
                <p className="od-item-name">{item.name}</p>
                <p className="od-item-qty">Qty: {item.qty}</p>
              </div>
              <div className="od-item-price-col">
                <span className="od-item-price">₹{(item.price * item.qty).toLocaleString()}</span>
                {item.qty > 1 && (
                  <span className="od-item-unit-price">₹{item.price} each</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Tracking timeline ── */}
        {order.status !== 'Cancelled' && (
          <div className="od-card od-track-card">
            <button className="od-track-toggle" onClick={() => setTrackOpen(o => !o)}>
              <div className="od-track-toggle-left">
                <IonIcon icon={carOutline} />
                <span>Track Order</span>
              </div>
              <IonIcon icon={trackOpen ? chevronUpOutline : chevronDownOutline} className="od-track-chevron" />
            </button>

            {trackOpen && (
              <div className="od-timeline">
                {steps.map((step, i) => {
                  const isCurrent = i === currentIdx;
                  const isLast = i === steps.length - 1;
                  return (
                    <div key={step.key} className={`od-tl-step ${step.done ? 'done' : 'pending'} ${isCurrent ? 'current' : ''}`}>
                      {!isLast && (
                        <div className={`od-tl-line ${step.done && i < currentIdx ? 'filled' : ''}`} />
                      )}
                      <div className="od-tl-icon-wrap">
                        <div className={`od-tl-icon ${step.done ? 'done' : 'pending'} ${isCurrent ? 'current' : ''}`}>
                          <IonIcon icon={step.done ? checkmarkCircle : step.icon} />
                        </div>
                      </div>
                      <div className="od-tl-content">
                        <div className="od-tl-header">
                          <p className={`od-tl-label ${step.done ? 'done' : 'pending'}`}>
                            {step.label}
                            {isCurrent && <span className="od-tl-current-pill">Now</span>}
                          </p>
                          {step.time && <span className="od-tl-time">{step.time}</span>}
                        </div>
                        <p className={`od-tl-desc ${step.done ? 'done' : 'pending'}`}>{step.description}</p>
                      </div>
                    </div>
                  );
                })}

                {order.status !== 'Delivered' && (
                  <div className="od-est-banner">
                    <IonIcon icon={homeOutline} />
                    <span>Expected by <strong>
                      {new Date(new Date(order.date).getTime() + 30 * 3600000)
                        .toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </strong></span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Delivery address ── */}
        <div className="od-card">
          <div className="od-card-title">Delivery Address</div>
          <div className="od-address-row">
            <div className="od-address-icon">
              <IonIcon icon={locationOutline} />
            </div>
            <div>
              <p className="od-address-name">John Doe <span className="od-address-tag">Home</span></p>
              <p className="od-address-line">123, MG Road, Bhubaneswar, Odisha - 751001</p>
              <p className="od-address-phone">+91 98765 43210</p>
            </div>
          </div>
        </div>

        {/* ── Payment summary ── */}
        <div className="od-card">
          <div className="od-card-title">Payment Summary</div>
          <div className="od-payment-method-row">
            <IonIcon icon={paymentIcon[payMethod] ?? cashOutline} className="od-pay-icon" />
            <div>
              <p className="od-pay-method-label">
                {payMethod === 'COD' ? 'Cash on Delivery' : payMethod === 'UPI' ? 'UPI / Net Banking' : 'Credit / Debit Card'}
              </p>
              <p className="od-pay-method-sub">
                {payMethod === 'COD' ? 'Pay on delivery' : 'Paid online'}
              </p>
            </div>
          </div>
          <div className="od-bill">
            <div className="od-bill-row">
              <span>Item Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <div className="od-bill-row">
              <span>Delivery Fee</span>
              <span>{delivery === 0 ? <span className="od-free">FREE</span> : `₹${delivery}`}</span>
            </div>
            <div className="od-bill-divider" />
            <div className="od-bill-total">
              <span>Total Paid</span>
              <span>₹{(total + delivery).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="od-actions">
          {order.status === 'Delivered' && (
            <>
              <button className="od-action-btn outline">
                <IonIcon icon={downloadOutline} /> Download Invoice
              </button>
              <button className="od-action-btn outline">
                <IonIcon icon={starOutline} /> Rate Products
              </button>
              <button className="od-action-btn solid">Buy Again</button>
            </>
          )}
          {(order.status === 'Processing' || order.status === 'In Transit') && (
            <>
              <button className="od-action-btn solid">
                <IonIcon icon={callOutline} /> Contact Support
              </button>
              <button className="od-action-btn outline danger">Cancel Order</button>
            </>
          )}
          {order.status === 'Cancelled' && (
            <button className="od-action-btn solid">Buy Again</button>
          )}
        </div>

        <div style={{ height: 32 }} />
      </IonContent>
    </IonPage>
  );
};

export default OrderDetailPage;