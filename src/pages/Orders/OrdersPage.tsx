import React, { useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonButton, IonIcon, IonBackButton, IonButtons,
} from '@ionic/react';
import {
  checkmarkCircle, timeOutline, carOutline, closeCircleOutline,
  chevronDownOutline, chevronUpOutline, callOutline, downloadOutline,
  bagHandleOutline, cubeOutline, locationOutline, cartOutline,
  businessOutline, homeOutline, starOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { mockOrders } from '../../utils/mockData';
import './Orders.css';

type FilterTab = 'all' | 'active' | 'delivered' | 'cancelled';

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  Delivered:    { color: 'success', icon: checkmarkCircle,   label: 'Delivered' },
  'In Transit': { color: 'warning', icon: carOutline,        label: 'In Transit' },
  Processing:   { color: 'primary', icon: timeOutline,       label: 'Processing' },
  Cancelled:    { color: 'danger',  icon: closeCircleOutline, label: 'Cancelled' },
};

/* ── Full tracking timeline steps ── */
interface TrackStep {
  key: string;
  label: string;
  description: string;
  icon: any;
  time?: string;
}

const buildTrackingSteps = (order: any): TrackStep[] => [
  {
    key: 'placed',
    label: 'Order Placed',
    description: `Your order #${order.id} was placed successfully.`,
    icon: cartOutline,
    time: new Date(order.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
  },
  {
    key: 'confirmed',
    label: 'Order Confirmed',
    description: 'Seller has confirmed your order and is preparing it.',
    icon: checkmarkCircle,
    time: order.status !== 'Processing' && order.status !== 'Cancelled'
      ? new Date(new Date(order.date).getTime() + 2 * 3600000).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : undefined,
  },
  {
    key: 'packed',
    label: 'Packed & Ready',
    description: 'Items packed and handed over to delivery partner.',
    icon: businessOutline,
    time: order.status === 'In Transit' || order.status === 'Delivered'
      ? new Date(new Date(order.date).getTime() + 26 * 3600000).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : undefined,
  },
  {
    key: 'shipped',
    label: 'Out for Delivery',
    description: 'Your order is out for delivery. Delivery partner is on the way.',
    icon: carOutline,
    time: order.status === 'In Transit' || order.status === 'Delivered'
      ? new Date(new Date(order.date).getTime() + 28 * 3600000).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : undefined,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Order delivered successfully. Enjoy your purchase!',
    icon: homeOutline,
    time: order.status === 'Delivered'
      ? new Date(new Date(order.date).getTime() + 30 * 3600000).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : undefined,
  },
];

const stepIndexForStatus = (status: string) => {
  if (status === 'Processing')   return 1;
  if (status === 'In Transit')   return 3;
  if (status === 'Delivered')    return 4;
  return 0;
};

const OrdersPage: React.FC = () => {
  const history = useHistory();
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showTracking, setShowTracking] = useState<string | null>(null);

  const filteredOrders = mockOrders.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'active') return o.status === 'Processing' || o.status === 'In Transit';
    if (filter === 'delivered') return o.status === 'Delivered';
    if (filter === 'cancelled') return o.status === 'Cancelled';
    return true;
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/tabs/home" /></IonButtons>
          <IonTitle>My Orders</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* Filter tabs */}
        <div className="order-filter-tabs">
          {([
            { key: 'all',       label: 'All' },
            { key: 'active',    label: 'Active' },
            { key: 'delivered', label: 'Delivered' },
            { key: 'cancelled', label: 'Cancelled' },
          ] as { key: FilterTab; label: string }[]).map(tab => (
            <button key={tab.key}
              className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
              onClick={() => setFilter(tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon-wrap">
              <IonIcon icon={bagHandleOutline} />
            </div>
            <h3>No orders {filter !== 'all' ? `in "${filter}"` : 'yet'}</h3>
            <p>When you place an order, it will show up here.</p>
            <IonButton className="orders-empty-btn" onClick={() => history.push('/tabs/home')}>
              Start Shopping
            </IonButton>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map(order => {
              const cfg = statusConfig[order.status] || statusConfig.Processing;
              const open = selected === order.id;
              const trackingOpen = showTracking === order.id;
              const currentStep = stepIndexForStatus(order.status);
              const itemCount = order.items.reduce((s: number, i: any) => s + i.qty, 0);
              const trackingSteps = buildTrackingSteps(order);

              return (
                <div key={order.id} className={`order-card ${open ? 'expanded' : ''}`}>

                  {/* ── Card header ── */}
                  <button className="order-header"
                    onClick={() => setSelected(open ? null : order.id)}>
                    <div className="order-header-left">
                      <div className={`order-status-icon ${cfg.color}`}>
                        <IonIcon icon={cfg.icon} />
                      </div>
                      <div>
                        <p className="order-id">#{order.id}</p>
                        <p className="order-date">
                          {new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {' · '}{itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>
                    <div className="order-header-right">
                      <span className={`status-badge ${cfg.color}`}>{cfg.label}</span>
                      <p className="order-total">₹{order.total.toLocaleString()}</p>
                    </div>
                  </button>

                  {/* ── Expanded details ── */}
                  {open && (
                    <div className="order-details">

                      {/* Items list */}
                      <div className="order-items-list">
                        {order.items.map((item: any, i: number) => (
                          <div key={i} className="order-item-row">
                            <div className="order-item-icon">
                              <IonIcon icon={cubeOutline} />
                            </div>
                            <div className="order-item-text">
                              <p className="order-item-name">{item.name}</p>
                              <p className="order-item-qty">Qty: {item.qty}</p>
                            </div>
                            <span className="order-item-price">₹{item.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      {/* ── Delivery info strip ── */}
                      {order.status !== 'Cancelled' && (
                        <div className="order-delivery-strip">
                          <IonIcon icon={locationOutline} />
                          <div>
                            <p className="delivery-strip-label">Delivering to</p>
                            <p className="delivery-strip-addr">123, MG Road, Bhubaneswar - 751001</p>
                          </div>
                        </div>
                      )}

                      {/* ── Track Order toggle ── */}
                      {order.status !== 'Cancelled' && (
                        <button
                          className="track-toggle-btn"
                          onClick={() => setShowTracking(trackingOpen ? null : order.id)}
                        >
                          <div className="track-toggle-left">
                            <IonIcon icon={carOutline} />
                            <span>Track Order</span>
                          </div>
                          <IonIcon
                            icon={trackingOpen ? chevronUpOutline : chevronDownOutline}
                            className="track-toggle-chevron"
                          />
                        </button>
                      )}

                      {/* ── Vertical tracking timeline ── */}
                      {trackingOpen && order.status !== 'Cancelled' && (
                        <div className="tracking-timeline">
                          {trackingSteps.map((step, i) => {
                            const isDone    = i <= currentStep;
                            const isCurrent = i === currentStep;
                            const isLast    = i === trackingSteps.length - 1;
                            return (
                              <div key={step.key} className={`timeline-step ${isDone ? 'done' : 'pending'} ${isCurrent ? 'current' : ''}`}>
                                {/* Line connecting steps */}
                                {!isLast && (
                                  <div className={`timeline-line ${isDone && i < currentStep ? 'filled' : ''}`} />
                                )}

                                {/* Step icon */}
                                <div className="timeline-icon-wrap">
                                  <div className={`timeline-icon ${isDone ? 'done' : 'pending'} ${isCurrent ? 'current' : ''}`}>
                                    <IonIcon icon={isDone ? checkmarkCircle : step.icon} />
                                  </div>
                                </div>

                                {/* Step content */}
                                <div className="timeline-content">
                                  <div className="timeline-header-row">
                                    <p className={`timeline-label ${isDone ? 'done' : 'pending'}`}>
                                      {step.label}
                                      {isCurrent && <span className="timeline-current-pill">Current</span>}
                                    </p>
                                    {step.time && (
                                      <span className="timeline-time">{step.time}</span>
                                    )}
                                  </div>
                                  <p className={`timeline-desc ${isDone ? 'done' : 'pending'}`}>
                                    {step.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}

                          {/* Estimated delivery */}
                          {order.status !== 'Delivered' && (
                            <div className="estimated-delivery">
                              <IonIcon icon={homeOutline} />
                              <span>Estimated delivery by <strong>
                                {new Date(new Date(order.date).getTime() + 30 * 3600000)
                                  .toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </strong></span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Cancelled note */}
                      {order.status === 'Cancelled' && (
                        <div className="cancelled-note">
                          <IonIcon icon={closeCircleOutline} />
                          <span>This order was cancelled</span>
                        </div>
                      )}

                      {/* ── Action buttons ── */}
                      <div className="order-actions">
                        {order.status === 'Delivered' && (
                          <>
                            <button className="order-action-btn outline">
                              <IonIcon icon={downloadOutline} /> Invoice
                            </button>
                            <button className="order-action-btn outline">
                              <IonIcon icon={starOutline} /> Rate
                            </button>
                            <button className="order-action-btn solid">Buy Again</button>
                          </>
                        )}
                        {(order.status === 'Processing' || order.status === 'In Transit') && (
                          <>
                            <button className="order-action-btn outline danger">Cancel</button>
                            <button className="order-action-btn outline">
                              <IonIcon icon={callOutline} /> Support
                            </button>
                          </>
                        )}
                        {order.status === 'Cancelled' && (
                          <button className="order-action-btn solid">Buy Again</button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Expand toggle chevron */}
                  <button className="order-expand-toggle"
                    onClick={() => setSelected(open ? null : order.id)}>
                    <IonIcon icon={open ? chevronUpOutline : chevronDownOutline} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ height: 24 }} />
      </IonContent>
    </IonPage>
  );
};
export default OrdersPage;