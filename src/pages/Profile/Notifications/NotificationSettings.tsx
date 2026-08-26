import React, { useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonToast, IonIcon,
} from '@ionic/react';
import {
  bagHandleOutline, pricetagOutline, megaphoneOutline,
  alertCircleOutline, phonePortraitOutline, mailOutline,
  notificationsOutline,
} from 'ionicons/icons';
import './Notifications.css';

interface ToggleSetting {
  id: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  label: string;
  sub: string;
  enabled: boolean;
}

interface ChannelSetting {
  id: string;
  icon: any;
  label: string;
  sub: string;
  enabled: boolean;
}

const NotificationSettings: React.FC = () => {
  const [showToast, setShowToast] = useState(false);

  const [types, setTypes] = useState<ToggleSetting[]>([
    {
      id: 'orders', enabled: true,
      icon: bagHandleOutline, iconColor: '#2171a8', iconBg: '#EEF5FB',
      label: 'Order Updates', sub: 'Confirmations, shipping & delivery',
    },
    {
      id: 'offers', enabled: true,
      icon: pricetagOutline, iconColor: '#2E7D32', iconBg: '#E8F5E9',
      label: 'Offers & Deals', sub: 'Promo codes, flash sales & discounts',
    },
    {
      id: 'announcements', enabled: false,
      icon: megaphoneOutline, iconColor: '#f4621d', iconBg: '#FFF3E0',
      label: 'Announcements', sub: 'New arrivals, product launches',
    },
    {
      id: 'alerts', enabled: true,
      icon: alertCircleOutline, iconColor: '#C62828', iconBg: '#FFEBEE',
      label: 'Stock Alerts', sub: 'Wishlist item restocks & low stock',
    },
    {
      id: 'reminders', enabled: false,
      icon: notificationsOutline, iconColor: '#607D8B', iconBg: '#ECEFF1',
      label: 'Reminders', sub: 'Cart reminders, reorder suggestions',
    },
  ]);

  const [channels, setChannels] = useState<ChannelSetting[]>([
    {
      id: 'push', enabled: true,
      icon: phonePortraitOutline,
      label: 'Push Notifications', sub: 'Alerts on your device',
    },
    {
      id: 'email', enabled: true,
      icon: mailOutline,
      label: 'Email Notifications', sub: 'Sent to your registered email',
    },
  ]);

  const toggleType = (id: string) => {
    setTypes(p => p.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
    setShowToast(true);
  };

  const toggleChannel = (id: string) => {
    setChannels(p => p.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
    setShowToast(true);
  };

  const allEnabled = types.every(t => t.enabled);

  const toggleAll = () => {
    const next = !allEnabled;
    setTypes(p => p.map(t => ({ ...t, enabled: next })));
    setShowToast(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/tabs/profile" /></IonButtons>
          <IonTitle>Notification Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>

        {/* ── Master toggle ── */}
        <div className="ns-master-card">
          <div className="ns-master-left">
            <div className="ns-master-icon">
              <IonIcon icon={notificationsOutline} />
            </div>
            <div>
              <p className="ns-master-label">All Notifications</p>
              <p className="ns-master-sub">
                {allEnabled ? 'All notifications are enabled' : 'Some notifications are disabled'}
              </p>
            </div>
          </div>
          <NsToggle enabled={allEnabled} onToggle={toggleAll} />
        </div>

        {/* ── Notification types ── */}
        <div className="ns-section">
          <p className="ns-section-title">Notification Types</p>
          <div className="ns-card">
            {types.map((t, i) => (
              <div key={t.id} className={`ns-row ${i < types.length - 1 ? 'bordered' : ''}`}>
                <div className="ns-row-icon" style={{ background: t.iconBg }}>
                  <IonIcon icon={t.icon} style={{ color: t.iconColor }} />
                </div>
                <div className="ns-row-text">
                  <p className="ns-row-label">{t.label}</p>
                  <p className="ns-row-sub">{t.sub}</p>
                </div>
                <NsToggle enabled={t.enabled} onToggle={() => toggleType(t.id)} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Channels ── */}
        <div className="ns-section">
          <p className="ns-section-title">Notification Channels</p>
          <div className="ns-card">
            {channels.map((c, i) => (
              <div key={c.id} className={`ns-row ${i < channels.length - 1 ? 'bordered' : ''}`}>
                <div className="ns-row-icon" style={{ background: '#F0F6FA' }}>
                  <IonIcon icon={c.icon} style={{ color: 'var(--medmeu-blue)' }} />
                </div>
                <div className="ns-row-text">
                  <p className="ns-row-label">{c.label}</p>
                  <p className="ns-row-sub">{c.sub}</p>
                </div>
                <NsToggle enabled={c.enabled} onToggle={() => toggleChannel(c.id)} />
              </div>
            ))}
          </div>
          <p className="ns-channel-note">
            You can manage your device's push notification permission from your phone's Settings app.
          </p>
        </div>

        <div style={{ height: 32 }} />
      </IonContent>

      <IonToast
        isOpen={showToast}
        message="Notification preference saved"
        duration={1200}
        position="bottom"
        color="success"
        onDidDismiss={() => setShowToast(false)}
      />
    </IonPage>
  );
};

/* ── Custom toggle component ── */
const NsToggle: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
  <button
    className={`ns-toggle ${enabled ? 'on' : 'off'}`}
    onClick={onToggle}
    aria-label="toggle"
  >
    <span className="ns-toggle-thumb" />
  </button>
);

export default NotificationSettings;