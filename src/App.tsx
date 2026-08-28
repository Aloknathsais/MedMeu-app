import React, { useEffect } from 'react';
import {
  IonApp, IonRouterOutlet, IonTabs, IonTabBar,
  IonTabButton, IonIcon, IonLabel, setupIonicReact,
  IonPage
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import {
  homeOutline, gridOutline, cartOutline,
  bagHandleOutline, personOutline,
} from 'ionicons/icons';
import { App as CapacitorApp } from '@capacitor/app';
import { AppProvider, useApp } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './pages/Auth/SplashScreen';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import HomePage from './pages/Home/HomePage';
import ProductsPage from './pages/Products/ProductsPage';
import ProductDetailPage from './pages/Products/ProductDetailPage';
import CartPage from './pages/Cart/CartPage';
import OrdersPage from './pages/Orders/OrdersPage';
import ProfilePage from './pages/Profile/ProfilePage';
import WishlistPage from './pages/Profile/WishlistPage';
import AboutDrawer from './components/AboutDrawer';
import OrderDetailPage from './pages/Orders/OrderDetailPage';
import CancelOrderPage from './pages/Orders/CancelOrder/CancelOrderPage';
import EditProfilePage from './pages/Profile/EditProfile/EditProfilePage';
import AddressBookPage from './pages/Profile/AddressBook/AddressBookPage';
import NotificationsPage from './pages/Profile/Notifications/NotificationsPage';
import NotificationSettings from './pages/Profile/Notifications/NotificationSettings';
import PrivacySecurityPage from './pages/Profile/PrivacySecurity/PrivacySecurityPage';
import ChangePasswordPage from './pages/Profile/PrivacySecurity/ChangePasswordPage';
import ActiveSessionsPage from './pages/Profile/PrivacySecurity/ActiveSessionsPage';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './theme/variables.css';
import './index.css';
import HelpSupportPage from './pages/Profile/HelpSupport/HelpSupportPage';

setupIonicReact({ mode: 'md' });

const TabsLayout: React.FC = () => {
  const { state } = useApp();
  return (
    <>
      <AboutDrawer />
      <IonPage id="main-content">
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/tabs/home"     component={HomePage} />
            <Route exact path="/tabs/products" component={ProductsPage} />
            <Route exact path="/tabs/cart"     component={CartPage} />
            {/* Orders and Profile require login — browsing home/products/cart doesn't */}
            <ProtectedRoute exact path="/tabs/orders"  component={OrdersPage} />
            <ProtectedRoute exact path="/tabs/profile" component={ProfilePage} />
            <Redirect exact from="/tabs" to="/tabs/home" />
          </IonRouterOutlet>

          <IonTabBar slot="bottom" className="custom-tab-bar">
            <IonTabButton tab="home" href="/tabs/home" className="custom-tab-btn">
              <div className="tab-icon-wrap">
                <IonIcon icon={homeOutline} />
              </div>
              <IonLabel>Home</IonLabel>
            </IonTabButton>

            <IonTabButton tab="products" href="/tabs/products" className="custom-tab-btn">
              <div className="tab-icon-wrap">
                <IonIcon icon={gridOutline} />
              </div>
              <IonLabel>Products</IonLabel>
            </IonTabButton>

            <IonTabButton tab="cart" href="/tabs/cart" className="custom-tab-btn cart-tab">
              <div className="cart-icon-wrap">
                <IonIcon icon={cartOutline} />
                {state.cartCount > 0 && (
                  <span className="tab-cart-badge">{state.cartCount}</span>
                )}
              </div>
              <IonLabel>Cart</IonLabel>
            </IonTabButton>

            <IonTabButton tab="orders" href="/tabs/orders" className="custom-tab-btn">
              <div className="tab-icon-wrap">
                <IonIcon icon={bagHandleOutline} />
              </div>
              <IonLabel>Orders</IonLabel>
            </IonTabButton>

            <IonTabButton tab="profile" href="/tabs/profile" className="custom-tab-btn">
              <div className="tab-icon-wrap">
                <IonIcon icon={personOutline} />
              </div>
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonPage>
    </>
  );
};  

const AppRoutes: React.FC = () => {
  const { state } = useApp();
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/splash"    component={SplashScreen} />
        <Route exact path="/login"     component={LoginPage} />
        <Route exact path="/register"  component={RegisterPage} />
        <Route exact path="/product/:id" component={ProductDetailPage} />

        {/* Everything below requires login */}
        <ProtectedRoute exact path="/wishlist"  component={WishlistPage} />
        <ProtectedRoute exact path="/order/:id" component={OrderDetailPage} />
        <ProtectedRoute exact path="/order/:id/cancel" component={CancelOrderPage} />
        <ProtectedRoute exact path="/profile/edit" component={EditProfilePage} />
        <ProtectedRoute exact path="/profile/address-book" component={AddressBookPage} />
        <ProtectedRoute exact path="/notifications" component={NotificationsPage} />
        <ProtectedRoute exact path="/notifications/settings" component={NotificationSettings} />
        <ProtectedRoute exact path="/privacy" component={PrivacySecurityPage} />
        <ProtectedRoute exact path="/privacy/change-password" component={ChangePasswordPage} />
        <ProtectedRoute exact path="/privacy/sessions" component={ActiveSessionsPage} />
        <ProtectedRoute exact path="/profile/help-support" component={HelpSupportPage} />

        <Route path="/tabs"            component={TabsLayout} />
        <Route exact path="/">
          <Redirect to="/splash" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    const handler = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      handler.then(h => h.remove());
    };
  }, []);

  return(
  <AppProvider>
    <IonApp>
      <AppRoutes />
    </IonApp>
  </AppProvider>

)};

export default App;