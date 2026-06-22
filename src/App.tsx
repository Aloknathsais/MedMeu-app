import React from 'react';
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

import { AppProvider, useApp } from './context/AppContext';
import SplashScreen from './pages/Auth/SplashScreen';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import HomePage from './pages/Home/HomePage';
// import ProductsPage from './pages/Products/ProductsPage';
// import ProductDetailPage from './pages/Products/ProductDetailPage';
// import CartPage from './pages/Cart/CartPage';
// import OrdersPage from './pages/Orders/OrdersPage';
import ProfilePage from './pages/Profile/ProfilePage';
import WishlistPage from './pages/Profile/WishlistPage';
import AboutDrawer from './components/AboutDrawer';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './theme/variables.css';
import './index.css';

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
        {/** 
        <Route exact path="/tabs/products" component={ProductsPage} />
        <Route exact path="/tabs/cart"     component={CartPage} />
        <Route exact path="/tabs/orders"   component={OrdersPage} />
        */}
        <Route exact path="/tabs/profile"  component={ProfilePage} />
        <Redirect exact from="/tabs" to="/tabs/home" />
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/tabs/home">
          <IonIcon icon={homeOutline} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton tab="products">
          <IonIcon icon={gridOutline} />
          <IonLabel>Products</IonLabel>
        </IonTabButton>
        <IonTabButton tab="cart">
          <IonIcon icon={cartOutline} />
          <IonLabel>Cart {state.cartCount > 0 ? `(${state.cartCount})` : ''}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="orders">
          <IonIcon icon={bagHandleOutline} />
          <IonLabel>Orders</IonLabel>
        </IonTabButton>
        <IonTabButton tab="profile" href="/tabs/profile">
          <IonIcon icon={personOutline} />
          <IonLabel>Profile</IonLabel>
        </IonTabButton>
        {/* <IonTabButton tab="products" href="/tabs/products">
          <IonIcon icon={gridOutline} />
          <IonLabel>Products</IonLabel>
        </IonTabButton>
        <IonTabButton tab="cart" href="/tabs/cart">
          <IonIcon icon={cartOutline} />
          <IonLabel>Cart {state.cartCount > 0 ? `(${state.cartCount})` : ''}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="orders" href="/tabs/orders">
          <IonIcon icon={bagHandleOutline} />
          <IonLabel>Orders</IonLabel>
        </IonTabButton>
        <IonTabButton tab="profile" href="/tabs/profile">
          <IonIcon icon={personOutline} />
          <IonLabel>Profile</IonLabel>
        </IonTabButton> */}
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
        <Route exact path="/wishlist"  component={WishlistPage} />
        {/* <Route exact path="/product/:id" component={ProductDetailPage} /> */}
        <Route path="/tabs"            component={TabsLayout} />
        <Route exact path="/">
          <Redirect to="/splash" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <IonApp>
      <AppRoutes />
    </IonApp>
  </AppProvider>
);

export default App;
