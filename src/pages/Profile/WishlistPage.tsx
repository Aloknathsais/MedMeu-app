import React from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonButton, IonIcon,
} from '@ionic/react';
import { heartOutline, starSharp, heart } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { mockProducts } from '../../utils/mockData';

const WishlistPage: React.FC = () => {
  const history = useHistory();
  const { state, dispatch } = useApp();

  const wishlistProducts = mockProducts.filter(p => state.wishlist.includes(p.id));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>My Wishlist ({wishlistProducts.length})</IonTitle></IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {wishlistProducts.length === 0 ? (
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
            {wishlistProducts.map(product => (
              <div key={product.id}
                style={{ background: 'white', borderRadius: 16, padding: 14, display: 'flex', gap: 12, boxShadow: 'var(--medmeu-card-shadow)', cursor: 'pointer', position: 'relative' }}
                onClick={() => history.push(`/product/${product.id}`)}>
                <img src={product.image} alt={product.name}
                  style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 10, background: '#f8f8f8' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 4px', lineHeight: 1.4 }}>{product.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#666', marginBottom: 6 }}>
                    <IonIcon icon={starSharp} color="warning" style={{ fontSize: 13 }} />
                    <span>{product.rating} ({product.reviews})</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>₹{product.price}</span>
                    <span style={{ fontSize: 12, color: '#999', textDecoration: 'line-through' }}>₹{product.originalPrice}</span>
                  </div>
                  <IonButton size="small"
                    onClick={e => { e.stopPropagation(); dispatch({ type: 'ADD_TO_CART', payload: { id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1, unit: product.unit } }); }}
                    style={{ '--border-radius': '8px', height: 30, fontSize: 12 }}>
                    Add to Cart
                  </IonButton>
                </div>
                <div style={{ position: 'absolute', top: 12, right: 12, cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id }); }}>
                  <IonIcon icon={heart} color="danger" style={{ fontSize: 22 }} />
                </div>
              </div>
            ))}
          </div>
        )}  
        <div style={{ height: 24 }} />
      </IonContent>
    </IonPage>
  );
};
export default WishlistPage;
