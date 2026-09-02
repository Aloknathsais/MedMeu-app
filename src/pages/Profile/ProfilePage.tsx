import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonItem, IonLabel, IonIcon, IonButton, IonAvatar, IonList,
  IonAlert,
} from '@ionic/react';
import {
  personOutline, locationOutline, heartOutline, helpCircleOutline,
  chevronForward, logOutOutline, notificationsOutline, shieldOutline, starOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useApp, User } from '../../context/AppContext';
import { authService } from '../../services/auth.service';
import { ordersService } from '../../services/orders.service';
import { addressesService } from '../../services/addresses.service';
import './Profile.css';

const ProfilePage: React.FC = () => {
  const history = useHistory();
  const { state, dispatch } = useApp();
  const [showLogout, setShowLogout] = useState(false);

  // Real counts — were hardcoded to 3 and 2 before.
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [addressCount, setAddressCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    ordersService.getMyOrderCount()
      .then(count => { if (!cancelled) setOrderCount(count); })
      .catch(err => console.error('Failed to load order count', err));
    addressesService.list()
      .then(addresses => { if (!cancelled) setAddressCount(addresses.length); })
      .catch(err => console.error('Failed to load address count', err));
    return () => { cancelled = true; };
  }, []);

  const user: User = state.user || { id: 'guest', name: 'Guest User', email: 'guest@medmeu.com', phone: '' };

  const handleLogout = () => {
    authService.logout();
    dispatch({ type: 'SET_AUTH', payload: false });
    dispatch({ type: 'SET_USER', payload: null });
    history.replace('/login');
  };

  const menuItems = [
    { icon: personOutline, label: 'Edit Profile', sub: 'Update your personal info', action: () => history.push('/profile/edit') },
    { icon: locationOutline, label: 'Address Book', sub: 'Manage delivery addresses', action: () => history.push('/profile/address-book') },
    { icon: heartOutline, label: 'My Wishlist', sub: `${state.wishlist.length} items saved`, action: () => history.push('/wishlist') },
    { icon: notificationsOutline, label: 'Notifications', sub: 'Manage alerts & reminders', action: () => history.push('/notifications') },
    { icon: shieldOutline, label: 'Privacy & Security', sub: 'Control your data', action: () => history.push('/privacy') },
    { icon: starOutline, label: 'Rate the App', sub: 'Tell us what you think', action: () => {} },
    { icon: helpCircleOutline, label: 'Help & Support', sub: 'FAQs, chat with us', action: () => history.push('/profile/help-support') },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>Profile</IonTitle></IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {/* Profile Hero */}
        <div className="profile-hero">
          <div className="profile-avatar-wrap">
            <IonAvatar className="profile-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" />
              ) : (
                <div className="avatar-placeholder">{user.name.charAt(0).toUpperCase()}</div>
              )}
            </IonAvatar>
          </div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          {user.phone && <p>{user.phone}</p>}
        </div>

        {/* Stats — real counts, fetched from the backend */}
        <div className="profile-stats">
          <div className="stat-item" onClick={() => history.push('/tabs/orders')}>
            <span className="stat-val">{orderCount ?? '—'}</span>
            <span className="stat-label">Orders</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item" onClick={() => history.push('/wishlist')}>
            <span className="stat-val">{state.wishlist.length}</span>
            <span className="stat-label">Wishlist</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item" onClick={() => history.push('/profile/address-book')}>
            <span className="stat-val">{addressCount ?? '—'}</span>
            <span className="stat-label">Addresses</span>
          </div>
        </div>

        {/* Menu */}
        <IonList className="profile-menu">
          {menuItems.map(item => (
            <IonItem key={item.label} button onClick={item.action} detail={false} className="profile-item">
              <div className="item-icon-wrap" slot="start">
                <IonIcon icon={item.icon} />
              </div>
              <IonLabel>
                <h3>{item.label}</h3>
                <p>{item.sub}</p>
              </IonLabel>
              <IonIcon icon={chevronForward} slot="end" color="medium" />
            </IonItem>
          ))}
        </IonList>

        <div style={{ padding: '16px 16px 32px' }}>
          <IonButton expand="block" fill="outline" color="danger" className="logout-btn" onClick={() => setShowLogout(true)}>
            <IonIcon icon={logOutOutline} slot="start" />
            Logout
          </IonButton>
          <p className="app-version">Medmeu v1.0.0 · Made with ❤️ for your health</p>
        </div>

        <IonAlert
          isOpen={showLogout}
          header="Logout"
          message="Are you sure you want to logout?"
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            { text: 'Logout', role: 'destructive', handler: handleLogout },
          ]}
          onDidDismiss={() => setShowLogout(false)}
        />
      </IonContent>
    </IonPage>
  );
};
export default ProfilePage;