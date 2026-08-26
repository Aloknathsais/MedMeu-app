import React, { useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonIcon, IonToast,
} from '@ionic/react';
import {
  notificationsOutline, bagHandleOutline, pricetagOutline,
  megaphoneOutline, checkmarkDoneOutline, trashOutline,
  alertCircleOutline, checkmarkCircleOutline, carOutline,
  giftOutline, informationCircleOutline, refreshOutline,
} from 'ionicons/icons';
import './Notifications.css';
import { useHistory } from 'react-router-dom';
import { settingsOutline } from 'ionicons/icons';

/* ── Types ── */
type NotifCategory = 'all' | 'orders' | 'offers' | 'general';
type NotifType = 'order' | 'offer' | 'general' | 'alert';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: any;
  iconColor: string;
  iconBg: string;
}

/* ── Mock notifications ── */
const INITIAL_NOTIFS: Notification[] = [
  {
    id: 'n1', type: 'order', read: false,
    title: 'Order Out for Delivery',
    message: 'Your order #ORD002 is out for delivery. Expected by today 6 PM.',
    time: '10 min ago',
    icon: carOutline, iconColor: '#f4621d', iconBg: '#FFF3E0',
  },
  {
    id: 'n2', type: 'offer', read: false,
    title: 'Flat 30% Off — Today Only!',
    message: 'Use code MED30 and get 30% off on all BP Monitors & Glucometers. Valid till midnight.',
    time: '1 hour ago',
    icon: pricetagOutline, iconColor: '#2E7D32', iconBg: '#E8F5E9',
  },
  {
    id: 'n3', type: 'order', read: false,
    title: 'Order Delivered',
    message: 'Your order #ORD001 has been delivered successfully. Rate your experience!',
    time: '2 hours ago',
    icon: checkmarkCircleOutline, iconColor: '#2171a8', iconBg: '#EEF5FB',
  },
  {
    id: 'n4', type: 'offer', read: true,
    title: 'New Arrivals — Baby Care',
    message: 'Check out the latest baby care products from Himalaya, Huggies & more. Free delivery on first order.',
    time: 'Yesterday',
    icon: giftOutline, iconColor: '#E91E63', iconBg: '#FCE4EC',
  },
  {
    id: 'n5', type: 'order', read: true,
    title: 'Order Confirmed',
    message: 'Your order #ORD003 has been confirmed and is being processed by the seller.',
    time: 'Yesterday',
    icon: checkmarkDoneOutline, iconColor: '#2E7D32', iconBg: '#E8F5E9',
  },
  {
    id: 'n6', type: 'general', read: true,
    title: 'Account Verified',
    message: 'Your email has been verified successfully. You can now enjoy all features of Medmeu.',
    time: '2 days ago',
    icon: checkmarkCircleOutline, iconColor: '#2171a8', iconBg: '#EEF5FB',
  },
  {
    id: 'n7', type: 'alert', read: true,
    title: 'Low Stock Alert',
    message: 'Omron HEM-7120 in your wishlist is running low. Order now before it sells out.',
    time: '3 days ago',
    icon: alertCircleOutline, iconColor: '#C62828', iconBg: '#FFEBEE',
  },
  {
    id: 'n8', type: 'offer', read: true,
    title: 'Weekend Sale — Up to 40% Off',
    message: 'Massive discounts on Diabetic Care, Lab Products and more. Shop now!',
    time: '4 days ago',
    icon: megaphoneOutline, iconColor: '#f4621d', iconBg: '#FFF3E0',
  },
  {
    id: 'n9', type: 'general', read: true,
    title: 'App Updated',
    message: 'Medmeu app has been updated with new features and performance improvements.',
    time: '1 week ago',
    icon: refreshOutline, iconColor: '#607D8B', iconBg: '#ECEFF1',
  },
];

const filterTabs: { key: NotifCategory; label: string; icon: any }[] = [
  { key: 'all',     label: 'All',     icon: notificationsOutline },
  { key: 'orders',  label: 'Orders',  icon: bagHandleOutline },
  { key: 'offers',  label: 'Offers',  icon: pricetagOutline },
  { key: 'general', label: 'General', icon: informationCircleOutline },
];

const NotificationsPage: React.FC = () => {
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFS);
  const [activeFilter, setActiveFilter] = useState<NotifCategory>('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'medium'>('success');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const history = useHistory();

  /* ── Derived ── */
  const unreadCount = notifs.filter(n => !n.read).length;

  const filtered = notifs.filter(n => {
    if (activeFilter === 'all')     return true;
    if (activeFilter === 'orders')  return n.type === 'order';
    if (activeFilter === 'offers')  return n.type === 'offer';
    if (activeFilter === 'general') return n.type === 'general' || n.type === 'alert';
    return true;
  });

  /* ── Actions ── */
  const markRead = (id: string) => {
    setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifs(p => p.map(n => ({ ...n, read: true })));
    setToastMsg('All notifications marked as read');
    setToastColor('success');
    setShowToast(true);
  };

  const deleteNotif = (id: string) => {
    setNotifs(p => p.filter(n => n.id !== id));
    setDeleteId(null);
    setToastMsg('Notification removed');
    setToastColor('medium');
    setShowToast(true);
  };

  const clearAll = () => {
    const filtered2 = activeFilter === 'all'
      ? []
      : notifs.filter(n => {
          if (activeFilter === 'orders')  return n.type !== 'order';
          if (activeFilter === 'offers')  return n.type !== 'offer';
          if (activeFilter === 'general') return n.type !== 'general' && n.type !== 'alert';
          return true;
        });
    setNotifs(filtered2);
    setToastMsg('Notifications cleared');
    setToastColor('medium');
    setShowToast(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/tabs/profile" /></IonButtons>
          <IonTitle>
            Notifications
            {unreadCount > 0 && (
              <span className="notif-title-badge">{unreadCount}</span>
            )}
          </IonTitle>
          {unreadCount > 0 && (
            <IonButtons slot="end">
              <button className="notif-mark-all-btn" onClick={markAllRead}>
                <IonIcon icon={checkmarkDoneOutline} />
                <span>Read All</span>
              </button>
              <button className="notif-settings-btn" onClick={() => history.push('/notifications/settings')}>
                <IonIcon icon={settingsOutline} />
              </button>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>

        {/* ── Filter tabs ── */}
        <div className="notif-filter-tabs">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              className={`notif-filter-tab ${activeFilter === tab.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(tab.key)}
            >
              <IonIcon icon={tab.icon} />
              {tab.label}
              {tab.key === 'all' && unreadCount > 0 && (
                <span className="notif-tab-badge">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Clear button row ── */}
        {filtered.length > 0 && (
          <div className="notif-action-row">
            <p className="notif-count-text">
              {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
              {filtered.filter(n => !n.read).length > 0 &&
                ` · ${filtered.filter(n => !n.read).length} unread`}
            </p>
            <button className="notif-clear-btn" onClick={clearAll}>
              <IonIcon icon={trashOutline} />
              Clear {activeFilter !== 'all' ? 'tab' : 'all'}
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {filtered.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">
              <IonIcon icon={notificationsOutline} />
            </div>
            <h3>No notifications</h3>
            <p>
              {activeFilter === 'all'
                ? "You're all caught up! New notifications will appear here."
                : `No ${activeFilter} notifications yet.`}
            </p>
          </div>
        ) : (
          /* ── Notification list ── */
          <div className="notif-list">
            {filtered.map(notif => {
              const isDeleting = deleteId === notif.id;
              return (
                <div
                  key={notif.id}
                  className={`notif-item ${notif.read ? 'read' : 'unread'}`}
                  onClick={() => { if (!notif.read) markRead(notif.id); }}
                >
                  {/* Unread dot */}
                  {!notif.read && <span className="notif-unread-dot" />}

                  {/* Icon */}
                  <div
                    className="notif-icon-wrap"
                    style={{ background: notif.iconBg }}
                  >
                    <IonIcon icon={notif.icon} style={{ color: notif.iconColor }} />
                  </div>

                  {/* Content */}
                  <div className="notif-content">
                    <div className="notif-content-top">
                      <p className="notif-title">{notif.title}</p>
                      <span className="notif-time">{notif.time}</span>
                    </div>
                    <p className="notif-message">{notif.message}</p>

                    {/* Action row */}
                    {!isDeleting ? (
                      <div className="notif-item-actions">
                        {!notif.read && (
                          <button
                            className="notif-action-link"
                            onClick={e => { e.stopPropagation(); markRead(notif.id); }}
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          className="notif-delete-link"
                          onClick={e => { e.stopPropagation(); setDeleteId(notif.id); }}
                        >
                          <IonIcon icon={trashOutline} /> Remove
                        </button>
                      </div>
                    ) : (
                      <div className="notif-delete-confirm" onClick={e => e.stopPropagation()}>
                        <span>Remove this notification?</span>
                        <div className="notif-confirm-btns">
                          <button className="notif-confirm-cancel"
                            onClick={() => setDeleteId(null)}>
                            Cancel
                          </button>
                          <button className="notif-confirm-remove"
                            onClick={() => deleteNotif(notif.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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
        duration={1500}
        position="bottom"
        color={toastColor}
        onDidDismiss={() => setShowToast(false)}
      />
    </IonPage>
  );
};

export default NotificationsPage;