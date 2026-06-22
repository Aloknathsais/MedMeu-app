import React from 'react';
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
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/auth.service';
import './Profile.css';
import { useState } from 'react';

const ProfilePage: React.FC = () => {
  const history = useHistory();
  const { state, dispatch } = useApp();
  const [showLogout, setShowLogout] = useState(false);

  const user = state.user || { name: 'Guest User', email: 'guest@medmeu.com', phone: '' };

  const handleLogout = () => {
    authService.logout();
    dispatch({ type: 'SET_AUTH', payload: false });
    dispatch({ type: 'SET_USER', payload: null });
    history.replace('/login');
  };

  const menuItems = [
    { icon: personOutline, label: 'Edit Profile', sub: 'Update your personal info', action: () => {} },
    { icon: locationOutline, label: 'Address Book', sub: 'Manage delivery addresses', action: () => {} },
    { icon: heartOutline, label: 'My Wishlist', sub: `${state.wishlist.length} items saved`, action: () => history.push('/wishlist') },
    { icon: notificationsOutline, label: 'Notifications', sub: 'Manage alerts & reminders', action: () => {} },
    { icon: shieldOutline, label: 'Privacy & Security', sub: 'Control your data', action: () => {} },
    { icon: starOutline, label: 'Rate the App', sub: 'Tell us what you think', action: () => {} },
    { icon: helpCircleOutline, label: 'Help & Support', sub: 'FAQs, chat with us', action: () => {} },
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
              <div className="avatar-placeholder">{user.name.charAt(0).toUpperCase()}</div>
            </IonAvatar>
          </div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          {user.phone && <p>{user.phone}</p>}
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-item" onClick={() => history.push('/tabs/orders')}>
            <span className="stat-val">3</span>
            <span className="stat-label">Orders</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-val">{state.wishlist.length}</span>
            <span className="stat-label">Wishlist</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-val">2</span>
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
