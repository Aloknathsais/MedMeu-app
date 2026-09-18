import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonButton, IonIcon, IonBackButton, IonButtons, IonSpinner, IonToast,
} from '@ionic/react';
import {
  checkmarkCircle, timeOutline, closeCircleOutline,
  chevronDownOutline, chevronUpOutline, callOutline, downloadOutline,
  bagHandleOutline, cubeOutline, locationOutline, cartOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ordersService, UiOrder, UiOrderStatus } from '../../services/orders.service';
import './Orders.css';

type FilterTab = 'all' | 'active' | 'delivered' | 'cancelled';

const statusConfig: Record<UiOrderStatus, { color: string; icon: any; label: string }> = {
  delivered:  { color: 'success', icon: checkmarkCircle,   label: 'Delivered' },
  processing: { color: 'primary', icon: timeOutline,       label: 'Processing' },
  cancelled:  { color: 'danger',  icon: closeCircleOutline, label: 'Cancelled' },
};

const OrdersPage: React.FC = () => {
  const history = useHistory();
  const { addToCart: persistAddToCart } = useApp();
  const [orders, setOrders] = useState<UiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [buyingAgain, setBuyingAgain] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  /**
   * Re-adds an order's items to the real cart. Order line items are a
   * HISTORICAL SNAPSHOT — the product may since be discontinued, out
   * of stock, or repriced. Each add is attempted independently so one
   * unavailable item doesn't block the rest; failures are summarized
   * afterward rather than silently dropped. Current price/availability
   * always comes from the real cart response regardless of what's
   * passed here — same "server is authoritative" principle used
   * throughout this app, so a stale snapshot price is harmless.
   */
  const buyAgain = async (order: UiOrder) => {
    setBuyingAgain(order.id);
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
          unit: 'unit', // best-effort placeholder — real value comes back from the server regardless, see comment above
          weight: 0,
        });
        added += 1;
      } catch (err) {
        console.error(`Failed to re-add "${item.name}" to cart`, err);
        failedNames.push(item.name);
      }
    }

    setBuyingAgain(null);

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

  const load = () => {
    setLoading(true);
    setError('');
    ordersService
      .list({ per_page: 50 }) // simple client-side filtering below; revisit with real pagination if order volume grows
      .then((res) => setOrders(res.orders))
      .catch((err) => {
        console.error('Failed to load orders', err);
        setError('Could not load your orders right now.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    if (filter === 'active') return o.status === 'processing';
    if (filter === 'delivered') return o.status === 'delivered';
    if (filter === 'cancelled') return o.status === 'cancelled';
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: '#888' }}>
            <IonSpinner name="crescent" />
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ color: '#C62828' }}>{error}</p>
            <IonButton onClick={load} style={{ marginTop: 12 }}>Retry</IonButton>
          </div>
        ) : filteredOrders.length === 0 ? (
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
              const cfg = statusConfig[order.status];
              const open = selected === order.id;

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
                        <p className="order-id">#{order.orderNumber}</p>
                        <p className="order-date">
                          {new Date(order.dateCreated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {' · '}{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
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

                      {/* Real items, from the actual order's line items — clicking one navigates to that product's detail page */}
                      <div className="order-items-list">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="order-item-row"
                            style={{ cursor: 'pointer' }}
                            onClick={() => history.push(`/product/${item.productId}`)}
                          >
                            <div className="order-item-icon">
                              {item.image ? (
                                <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                              ) : (
                                <IonIcon icon={cubeOutline} />
                              )}
                            </div>
                            <div className="order-item-text">
                              <p className="order-item-name">{item.name}</p>
                              <p className="order-item-qty">Qty: {item.quantity}</p>
                            </div>
                            <span className="order-item-price">₹{item.total.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      {/* Real delivery address — was hardcoded "123, MG Road..." before */}
                      {order.status !== 'cancelled' && (
                        <div className="order-delivery-strip">
                          <IonIcon icon={locationOutline} />
                          <div>
                            <p className="delivery-strip-label">Delivering to</p>
                            <p className="delivery-strip-addr">
                              {order.address.line1}
                              {order.address.line2 ? `, ${order.address.line2}` : ''}, {order.address.city} - {order.address.pincode}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* ── Simplified real status — no fabricated packed/
                          shipped timestamps. WooCommerce only actually
                          confirms 3 real moments: placed, (in progress),
                          and completed. A real "in transit" step would
                          need a shipment-tracking plugin, which hasn't
                          been checked yet — see the caveat in
                          orders.service.ts. ── */}
                      {order.status !== 'cancelled' && (
                        <div className="order-status-note">
                          <IonIcon icon={order.status === 'delivered' ? checkmarkCircle : cartOutline} />
                          <span>
                            {order.status === 'delivered'
                              ? `Delivered on ${order.dateCompleted ? new Date(order.dateCompleted).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}`
                              : 'Your order is being processed.'}
                          </span>
                        </div>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="cancelled-note">
                          <IonIcon icon={closeCircleOutline} />
                          <span>This order was cancelled</span>
                        </div>
                      )}

                      {/* ── Action buttons ──
                          Invoice/Support are NOT wired to anything real
                          yet — disabled rather than left silently
                          broken. Buy Again re-adds this order's items
                          to the real cart (see buyAgain() above). */}
                      <div className="order-actions">
                        {order.status === 'delivered' && (
                          <>
                            <button className="order-action-btn outline"
                              onClick={() => history.push(`/order/${order.id}`)}>
                              View Details
                            </button>
                            <button className="order-action-btn outline" disabled title="Coming soon">
                              <IonIcon icon={downloadOutline} /> Invoice
                            </button>
                            <button
                              className="order-action-btn solid"
                              disabled={buyingAgain === order.id}
                              onClick={() => buyAgain(order)}
                            >
                              {buyingAgain === order.id ? 'Adding...' : 'Buy Again'}
                            </button>
                          </>
                        )}
                        {order.status === 'processing' && (
                          <>
                            <button className="order-action-btn outline"
                              onClick={() => history.push(`/order/${order.id}`)}>
                              View Details
                            </button>
                            {order.isCancellable && (
                              <button className="order-action-btn outline danger"
                                onClick={() => history.push(`/order/${order.id}/cancel`)}>
                                Cancel Order
                              </button>
                            )}
                            <button className="order-action-btn outline" disabled title="Coming soon">
                              <IonIcon icon={callOutline} /> Support
                            </button>
                          </>
                        )}
                        {order.status === 'cancelled' && (
                          <>
                            <button className="order-action-btn outline"
                              onClick={() => history.push(`/order/${order.id}`)}>
                              View Details
                            </button>
                            <button
                              className="order-action-btn solid"
                              disabled={buyingAgain === order.id}
                              onClick={() => buyAgain(order)}
                            >
                              {buyingAgain === order.id ? 'Adding...' : 'Buy Again'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

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
export default OrdersPage;