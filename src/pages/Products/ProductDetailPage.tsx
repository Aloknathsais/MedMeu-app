import React, { useState, useRef } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonBackButton, IonButtons,
  IonButton, IonIcon, IonBadge, IonToast,
} from '@ionic/react';
import {
  heartOutline, heart, cartOutline, starSharp, shareSocialOutline,
  shieldCheckmarkOutline, refreshOutline, carOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { mockProducts } from '../../utils/mockData';
import './Products.css';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { state, dispatch } = useApp();
  const [qty, setQty] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'desc' | 'spec' | 'reviews'>('desc');
  const [activeImg, setActiveImg] = useState(0);

  // Swipe tracking
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const product = mockProducts.find(p => p.id === id);
  if (!product) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton /></IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <p style={{ padding: 24, textAlign: 'center', color: '#888' }}>Product not found</p>
        </IonContent>
      </IonPage>
    );
  }

  const inWishlist = state.wishlist.includes(product.id);

  // Use 3 copies of the same image as placeholder gallery
  // Replace with product.images array when your API provides multiple images
  const images = [product.image, product.image, product.image];

  const goToSlide = (index: number) => {
    setActiveImg(index);
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: index * sliderRef.current.clientWidth,
        behavior: 'smooth',
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeImg < images.length - 1) {
        goToSlide(activeImg + 1);
      } else if (diff < 0 && activeImg > 0) {
        goToSlide(activeImg - 1);
      }
    }
  };

  const handleSliderScroll = () => {
    if (sliderRef.current) {
      const idx = Math.round(sliderRef.current.scrollLeft / sliderRef.current.clientWidth);
      setActiveImg(idx);
    }
  };

  const addToCart = () => {
    for (let i = 0; i < qty; i++) {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
          unit: product.unit,
        },
      });
    }
    setToastMsg('Added to cart!');
    setShowToast(true);
  };

  const buyNow = () => { addToCart(); history.push('/tabs/cart'); };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="detail-toolbar">
          <IonButtons slot="start"><IonBackButton color="dark" /></IonButtons>
          <IonButtons slot="end">
            <IonButton><IonIcon icon={shareSocialOutline} color="dark" /></IonButton>
            <IonButton onClick={() => dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id })}>
              <IonIcon icon={inWishlist ? heart : heartOutline} color={inWishlist ? 'danger' : 'dark'} />
            </IonButton>
            <IonButton onClick={() => history.push('/tabs/cart')}>
              <IonIcon icon={cartOutline} color="dark" />
              {state.cartCount > 0 && (
                <IonBadge color="danger" className="detail-cart-badge">{state.cartCount}</IonBadge>
              )}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>

        {/* ── Image Slider ── */}
        <div className="img-slider-wrap">
          {/* Discount badge */}
          {product.discount > 0 && (
            <span className="detail-discount">{product.discount}% OFF</span>
          )}

          {/* Image count indicator */}
          <span className="img-count-badge">{activeImg + 1} / {images.length}</span>

          {/* Slider track */}
          <div
            className="img-slider-track"
            ref={sliderRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onScroll={handleSliderScroll}
          >
            {images.map((img, i) => (
              <div key={i} className="img-slider-slide">
                <img src={img} alt={`${product.name} ${i + 1}`} className="img-slider-img" />
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="img-slider-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`img-slider-dot ${i === activeImg ? 'active' : ''}`}
                onClick={() => goToSlide(i)}
              />
            ))}
          </div>

          {/* Left / Right arrows */}
          {activeImg > 0 && (
            <button className="slider-arrow left" onClick={() => goToSlide(activeImg - 1)}>‹</button>
          )}
          {activeImg < images.length - 1 && (
            <button className="slider-arrow right" onClick={() => goToSlide(activeImg + 1)}>›</button>
          )}
        </div>

        {/* ── Thumbnail strip ── */}
        <div className="detail-thumbs">
          {images.map((img, i) => (
            <button
              key={i}
              className={`thumb-btn ${activeImg === i ? 'active' : ''}`}
              onClick={() => goToSlide(i)}
            >
              <img src={img} alt="" />
            </button>
          ))}
        </div>

        {/* ── Product Info ── */}
        <div className="detail-body">
          <div className="detail-top-row">
            <p className="detail-brand">{product.brand}</p>
            <span className={`stock-pill ${product.inStock ? 'in' : 'out'}`}>
              {product.inStock ? '✓ In Stock' : 'Out of Stock'}
            </span>
          </div>

          <h2 className="detail-name">{product.name}</h2>

          <div className="detail-rating-row">
            <div className="detail-rating">
              <IonIcon icon={starSharp} color="warning" />
              <span>{product.rating}</span>
            </div>
            <span className="detail-reviews">{product.reviews.toLocaleString()} ratings</span>
          </div>

          <div className="detail-price-card">
            <div className="detail-price-row">
              <span className="detail-price">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="detail-original">₹{product.originalPrice}</span>
                  <span className="detail-save-pct">{product.discount}% off</span>
                </>
              )}
            </div>
            <p className="detail-unit">Price for {product.unit} · Inclusive of all taxes</p>
          </div>

          {/* Qty selector */}
          <div className="qty-row">
            <span className="qty-label">Quantity</span>
            <div className="qty-controls">
              <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="qty-val">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(qty + 1)}>+</button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="detail-trust-row">
            <div className="trust-pill"><IonIcon icon={carOutline} /><span>Free Delivery</span></div>
            <div className="trust-pill"><IonIcon icon={refreshOutline} /><span>7-Day Return</span></div>
            <div className="trust-pill"><IonIcon icon={shieldCheckmarkOutline} /><span>100% Genuine</span></div>
          </div>

          {/* Tabs */}
          <div className="detail-tabs">
            <button className={`detail-tab ${activeTab === 'desc' ? 'active' : ''}`} onClick={() => setActiveTab('desc')}>Description</button>
            <button className={`detail-tab ${activeTab === 'spec' ? 'active' : ''}`} onClick={() => setActiveTab('spec')}>Specifications</button>
            <button className={`detail-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews</button>
          </div>

          {activeTab === 'desc' && (
            <p className="detail-desc">{product.description}</p>
          )}

          {activeTab === 'spec' && (
            <ul className="detail-specs">
              {product.specs.map((s, i) => (
                <li key={i}><span>✓</span>{s}</li>
              ))}
            </ul>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-summary">
              <div className="review-score-block">
                <span className="review-big-score">{product.rating}</span>
                <div className="review-stars-row">
                  {[1, 2, 3, 4, 5].map(n => (
                    <IonIcon key={n} icon={starSharp} color={n <= Math.round(product.rating) ? 'warning' : 'medium'} />
                  ))}
                </div>
                <p className="review-count-text">{product.reviews.toLocaleString()} ratings</p>
              </div>
              <p className="review-placeholder">Customer reviews will appear here once submitted.</p>
            </div>
          )}
        </div>

        <div style={{ height: 110 }} />
      </IonContent>

      {/* Bottom CTA */}
      <div className="detail-cta">
        <IonButton expand="block" fill="outline" className="cta-cart" onClick={addToCart} disabled={!product.inStock}>
          <IonIcon icon={cartOutline} slot="start" />
          Add to Cart
        </IonButton>
        <IonButton expand="block" className="cta-buy" onClick={buyNow} disabled={!product.inStock}>
          Buy Now
        </IonButton>
      </div>

      <IonToast
        isOpen={showToast}
        message={toastMsg}
        duration={1500}
        onDidDismiss={() => setShowToast(false)}
        position="bottom"
        color="success"
      />
    </IonPage>
  );
};
export default ProductDetailPage;