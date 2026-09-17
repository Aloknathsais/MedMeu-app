import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonButton, IonIcon, IonSpinner, IonToast,
  IonButtons, IonBackButton,
} from '@ionic/react';
import { heart } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { wishlistService, WishlistItem } from '../../services/wishlist.service';

const WishlistPage: React.FC = () => {
  const history = useHistory();
  const { addToCart: persistAddToCart } = useApp();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Fetches the full wishlist directly — not just the id list AppContext
  // keeps for heart-icon state elsewhere. The backend already returns
  // name/price/image/stock per item (see medmeu_app_wishlist_serialize()
  // in medmeu-app-wishlist-api.php), so there's no need to cross-reference
  // against a separate product list here.
  const load = () => {
    setLoading(true);
    setError('');
    wishlistService
      .list()
      .then((data) => setItems(data.items))
      .catch((err) => {
        console.error('Failed to load wishlist', err);
        setError('Could not load your wishlist right now.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = (productId: string) => {
    wishlistService
      .remove(productId)
      .then((data) => setItems(data.items))
      .catch((err) => {
        console.error('Failed to remove from wishlist', err);
        setToastMsg('Could not remove item — please try again.');
        setShowToast(true);
      });
  };

  const addToCart = (item: WishlistItem) => {
    persistAddToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      unit: item.unit,
      weight: item.weight,
    })
      .then(() => {
        setToastMsg('Added to cart!');
        setShowToast(true);
      })
      .catch((err) => {
        console.error('Failed to add to cart', err);
        const message =
          err?.response?.data?.message || 'Could not add to cart — please try again.';
        setToastMsg(message);
        setShowToast(true);
      });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/tabs/profile" /></IonButtons>
          <IonTitle>My Wishlist ({items.length})</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: '#888' }}>
            <IonSpinner name="crescent" />
            <p>Loading your wishlist...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ color: '#C62828' }}>{error}</p>
            <IonButton onClick={load} style={{ marginTop: 12 }}>Retry</IonButton>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 32px' }}>
            <div style={{ fontSize: 64 }}>💛</div>
            <h3 style={{ color: '#333', fontWeight: 700 }}>Your wishlist is empty</h3>
            <p style={{ color: '#888', fontSize: 14 }}>Save products you love by tapping the heart icon</p>
            <IonButton onClick={() => history.push('/tabs/home')} style={{ marginTop: 16 }}>
              Explore Products
            </IonButton>
          </div>
        ) : (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map(item => (
              <div key={item.id}
                style={{ background: 'white', borderRadius: 16, padding: 14, display: 'flex', gap: 12, boxShadow: 'var(--medmeu-card-shadow)', cursor: 'pointer', position: 'relative' }}
                onClick={() => history.push(`/product/${item.id}`)}>
                <img src={item.image} alt={item.name}
                  style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 10, background: '#f8f8f8' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 4px', lineHeight: 1.4 }}>{item.name}</p>
                  {/* Real stock status — we don't have rating/review data
                      on wishlist items (the backend doesn't return it,
                      and fetching it separately per item would mean an
                      extra request for every product just to show
                      stars), so this replaces the old fake rating row
                      with something we actually know is accurate. */}
                  <p style={{ fontSize: 12, color: item.inStock ? '#2E7D32' : '#C62828', margin: '0 0 6px', fontWeight: 600 }}>
                    {item.inStock ? '✓ In Stock' : 'Out of Stock'}
                  </p>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>₹{item.price}</span>
                  </div>
                  <IonButton size="small"
                    disabled={!item.inStock}
                    onClick={e => { e.stopPropagation(); addToCart(item); }}
                    style={{ '--border-radius': '8px', height: 30, fontSize: 12 }}>
                    {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </IonButton>
                </div>
                <div style={{ position: 'absolute', top: 12, right: 12, cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); remove(item.id); }}>
                  <IonIcon icon={heart} color="danger" style={{ fontSize: 22 }} />
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ height: 24 }} />
      </IonContent>

      <IonToast
        isOpen={showToast}
        message={toastMsg}
        duration={1500}
        onDidDismiss={() => setShowToast(false)}
        position="bottom"
        color={toastMsg === 'Added to cart!' ? 'success' : 'danger'}
      />
    </IonPage>
  );
};
export default WishlistPage;