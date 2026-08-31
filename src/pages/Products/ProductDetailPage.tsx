import React, { useState, useRef, useEffect } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonBackButton, IonButtons,
  IonButton, IonIcon, IonBadge, IonToast, IonSpinner,
} from '@ionic/react';
import {
  heartOutline, heart, cartOutline, starSharp, shareSocialOutline,
  shieldCheckmarkOutline, refreshOutline, carOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { productsService, UiProduct } from '../../services/products.service';
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

  const [product, setProduct] = useState<UiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Swipe tracking
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setActiveImg(0);
    setQty(1);
    productsService.getById(id)
      .then(p => { if (!cancelled) setProduct(p); })
      .catch(err => {
        console.error('Failed to load product', err);
        if (!cancelled) setNotFound(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton /></IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888' }}>
            <IonSpinner name="crescent" />
            <p>Loading product...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (notFound || !product) {
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
  const images = product.images; // real gallery from WooCommerce — no more 3x duplicate placeholder
  const maxQty = product.stockQuantity ?? 99;

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
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: qty,
        unit: product.unit,
      },
    });
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

        {/* ── Image Slider (real gallery — however many images WooCommerce actually has) ── */}
        <div className="img-slider-wrap">
          {product.discount > 0 && (
            <span className="detail-discount">{product.discount}% OFF</span>
          )}

          {images.length > 1 && (
            <span className="img-count-badge">{activeImg + 1} / {images.length}</span>
          )}

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

          {images.length > 1 && (
            <div className="img-slider-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`img-slider-dot ${i === activeImg ? 'active' : ''}`}
                  onClick={() => goToSlide(i)}
                />
              ))}
            </div>
          )}

          {activeImg > 0 && (
            <button className="slider-arrow left" onClick={() => goToSlide(activeImg - 1)}>‹</button>
          )}
          {activeImg < images.length - 1 && (
            <button className="slider-arrow right" onClick={() => goToSlide(activeImg + 1)}>›</button>
          )}
        </div>

        {/* ── Thumbnail strip (only when there's more than one real image) ── */}
        {images.length > 1 && (
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
        )}

        {/* ── Product Info ── */}
        <div className="detail-body">
          <div className="detail-top-row">
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
            <p className="detail-unit">Inclusive of all taxes</p>
          </div>

          {/* Qty selector — capped at real stock quantity when WooCommerce is tracking it */}
          <div className="qty-row">
            <span className="qty-label">Quantity</span>
            <div className="qty-controls">
              <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="qty-val">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(Math.min(maxQty, qty + 1))}>+</button>
            </div>
          </div>
          {product.stockQuantity != null && product.stockQuantity <= 10 && (
            <p style={{ fontSize: 12, color: '#C62828', margin: '-8px 0 12px' }}>
              Only {product.stockQuantity} left in stock
            </p>
          )}

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
            product.descriptionHtml ? (
              // Content comes from your own WooCommerce product editor (trusted
              // first-party source), not user input — safe to render as HTML.
              <div className="detail-desc" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            ) : (
              <p className="detail-desc">{product.shortDescription || 'No description available.'}</p>
            )
          )}

          {activeTab === 'spec' && (
            product.specs.length > 0 ? (
              <ul className="detail-specs">
                {product.specs.map((s, i) => (
                  <li key={i}><span>✓</span>{s.name}: {s.value}</li>
                ))}
              </ul>
            ) : (
              <p className="detail-desc">No specifications available for this product.</p>
            )
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