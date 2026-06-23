import React, { useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonButton, IonIcon, IonBackButton, IonButtons,
} from '@ionic/react';
import {
  checkmarkCircle, timeOutline, carOutline, closeCircleOutline,
  chevronDownOutline, chevronUpOutline, callOutline, downloadOutline,
  bagHandleOutline, cubeOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { mockOrders } from '../../utils/mockData';
import './Orders.css';

type FilterTab = 'all' | 'active' | 'delivered' | 'cancelled';

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  Delivered:   { color: 'success', icon: checkmarkCircle,  label: 'Delivered' },
  'In Transit':{ color: 'warning', icon: carOutline,       label: 'In Transit' },
  Processing:  { color: 'primary', icon: timeOutline,      label: 'Processing' },
  Cancelled:   { color: 'danger',  icon: closeCircleOutline, label: 'Cancelled' },
};

const trackSteps = ['Order Placed', 'Confirmed', 'Shipped', 'Delivered'];
const stepIndexForStatus = (status: string) => {
  if (status === 'Processing') return 1;
  if (status === 'In Transit') return 2;
  if (status === 'Delivered') return 3;
  return 0;
};

const OrdersPage: React.FC = () => {
  const history = useHistory();
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');

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
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'delivered', label: 'Delivered' },
            { key: 'cancelled', label: 'Cancelled' },
          ] as { key: FilterTab; label: string }[]).map(tab => (
            <button
              key={tab.key}
              className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
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
              const currentStep = stepIndexForStatus(order.status);
              const itemCount = order.items.reduce((s, i) => s + i.qty, 0);

              return (
                <div key={order.id} className={`order-card ${open ? 'expanded' : ''}`}>
                  <button className="order-header" onClick={() => setSelected(open ? null : order.id)}>
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

                  {open && (
                    <div className="order-details">
                      {/* Items */}
                      <div className="order-items-list">
                        {order.items.map((item, i) => (
                          <div key={i} className="order-item-row">
                            <div className="order-item-icon"><IonIcon icon={cubeOutline} /></div>
                            <div className="order-item-text">
                              <p className="order-item-name">{item.name}</p>
                              <p className="order-item-qty">Qty: {item.qty}</p>
                            </div>
                            <span className="order-item-price">₹{item.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tracker */}
                      {order.status !== 'Cancelled' && (
                        <div className="order-track">
                          {trackSteps.map((step, i) => (
                            <div key={step} className={`track-step ${i <= currentStep ? 'done' : ''} ${i === currentStep ? 'current' : ''}`}>
                              <div className="track-dot">{i <= currentStep && <IonIcon icon={checkmarkCircle} />}</div>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {order.status === 'Cancelled' && (
                        <div className="cancelled-note">
                          <IonIcon icon={closeCircleOutline} />
                          <span>This order was cancelled</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="order-actions">
                        {order.status === 'Delivered' && (
                          <>
                            <button className="order-action-btn outline">
                              <IonIcon icon={downloadOutline} /> Invoice
                            </button>
                            <button className="order-action-btn solid">Buy Again</button>
                          </>
                        )}
                        {(order.status === 'Processing' || order.status === 'In Transit') && (
                          <>
                            <button className="order-action-btn outline danger">Cancel Order</button>
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

                  <button className="order-expand-toggle" onClick={() => setSelected(open ? null : order.id)}>
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