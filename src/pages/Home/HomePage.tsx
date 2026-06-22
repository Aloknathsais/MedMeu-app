import React, { useState, useRef, useEffect } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar,
  IonBadge, IonIcon, IonRefresher, IonRefresherContent,
  IonButton, IonChip, IonMenuButton,
} from '@ionic/react';
import {
  cartOutline, notificationsOutline, heartOutline, heart,
  starSharp, searchOutline, closeOutline, arrowForward, menuOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { mockCategories, mockProducts, mockBanners, mockTestimonials, mockTrustBadges } from '../../utils/mockData';
import Logo from '../../assets/logo.png';
import './Home.css';

const HomePage: React.FC = () => {
  const history = useHistory();
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const bannerScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 150);
    }
  }, [searchOpen]);

  const addToCart = (product: any) => {
    dispatch({ type: 'ADD_TO_CART', payload: { id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1, unit: product.unit } });
  };

  const toggleWishlist = (id: string) => dispatch({ type: 'TOGGLE_WISHLIST', payload: id });

  const handleRefresh = async (e: any) => {
    await new Promise(r => setTimeout(r, 1000));
    e.detail.complete();
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearch('');
  };

  const handleBannerScroll = () => {
    const el = bannerScrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveBanner(idx);
  };

  const filteredProducts = mockProducts.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader className="home-header">
        {!searchOpen ? (
          <IonToolbar>
            <div className="header-content">
              <div className="header-left-group">
                <IonMenuButton menu="about-menu" autoHide={false} className="menu-btn">
                  <IonIcon icon={menuOutline} className="header-icon" />
                </IonMenuButton>
                <div className="header-logo">
                  <img src={Logo} alt="Medmeu" />
                </div>
              </div>
              <div className="header-actions">
                <IonIcon icon={searchOutline} className="header-icon" onClick={() => setSearchOpen(true)} />
                <IonIcon icon={notificationsOutline} className="header-icon" />
                <div className="cart-wrap" onClick={() => history.push('/tabs/cart')}>
                  <IonIcon icon={cartOutline} className="header-icon" />
                  {state.cartCount > 0 && <IonBadge className="cart-badge">{state.cartCount}</IonBadge>}
                </div>
              </div>
            </div>
          </IonToolbar>
        ) : (
          <IonToolbar>
            <div className="search-bar-active">
              <IonIcon icon={searchOutline} className="search-bar-icon" />
              <input
                ref={searchInputRef}
                className="search-bar-input"
                placeholder="Search medicines, devices..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
              <IonIcon icon={closeOutline} className="search-bar-close" onClick={closeSearch} />
            </div>
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {searchOpen && search ? (
          /* ── Search results view ── */
          <>
            <p className="result-count">{filteredProducts.length} results for "{search}"</p>
            {filteredProducts.length === 0 ? (
              <div className="empty-state">
                <span>🔍</span>
                <p>No products found for "{search}"</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    inWishlist={state.wishlist.includes(product.id)}
                    onCardClick={() => history.push(`/product/${product.id}`)}
                    onWishlist={() => toggleWishlist(product.id)}
                    onAddToCart={() => addToCart(product)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* ── Offer Banner Carousel ── */}
            <div className="banner-section">
              <div className="banner-slider" ref={bannerScrollRef} onScroll={handleBannerScroll}>
                {mockBanners.map(b => (
                  <div key={b.id} className="banner-card" style={{ background: b.bg }}>
                    <span className="banner-badge">{b.badge}</span>
                    <div className="banner-text">
                      <h3>{b.title}</h3>
                      <p>{b.subtitle}</p>
                      <button className="banner-cta">
                        {b.cta} <IonIcon icon={arrowForward} />
                      </button>
                    </div>
                    <img src={b.image} alt="" className="banner-img" />
                  </div>
                ))}
              </div>
              <div className="banner-dots">
                {mockBanners.map((_, i) => (
                  <span key={i} className={`banner-dot ${i === activeBanner ? 'active' : ''}`} />
                ))}
              </div>
            </div>

            {/* ── Categories ── */}
            <div className="section-header">
              <h2>Shop by Category</h2>
              <span onClick={() => history.push('/tabs/products')}>See All</span>
            </div>
            <div className="category-grid">
              {mockCategories.map(cat => (
                <div key={cat.id} className="category-item" onClick={() => history.push(`/tabs/products?cat=${cat.id}`)}>
                  <div className="category-icon" style={{ background: `${cat.color}18` }}>
                    <span>{cat.icon}</span>
                  </div>
                  <p className="category-name">{cat.name}</p>
                  <span className="category-count">{cat.count} items</span>
                </div>
              ))}
            </div>

            {/* ── Featured Products ── */}
            <div className="section-header">
              <h2>Featured Products</h2>
              <span onClick={() => history.push('/tabs/products')}>See All</span>
            </div>
            <div className="products-grid">
              {mockProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  inWishlist={state.wishlist.includes(product.id)}
                  onCardClick={() => history.push(`/product/${product.id}`)}
                  onWishlist={() => toggleWishlist(product.id)}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </div>

            {/* ── Testimonials ── */}
            <div className="section-header">
              <h2>What Our Customers Say About Us</h2>
            </div>
            <div className="testimonial-slider">
              {mockTestimonials.map((t, i) => (
                <TestimonialCard key={i} testimonial={t} />
              ))}
            </div>

            {/* ── Trust Badges ── */}
            <div className="trust-strip">
              {mockTrustBadges.map((b, i) => (
                <div key={i} className="trust-item">
                  <span className="trust-icon">{b.icon}</span>
                  <div>
                    <p className="trust-title">{b.title}</p>
                    <p className="trust-subtitle">{b.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

          </>
        )}
        <div style={{ height: 24 }} />
      </IonContent>
    </IonPage>
  );
};

/* ── Reusable product card ── */
const ProductCard: React.FC<{
  product: any;
  inWishlist: boolean;
  onCardClick: () => void;
  onWishlist: () => void;
  onAddToCart: () => void;
}> = ({ product, inWishlist, onCardClick, onWishlist, onAddToCart }) => (
  <div className="product-card" onClick={onCardClick}>
    <div className="product-img-wrap">
      <img src={product.image} alt={product.name} loading="lazy" />
      {product.discount > 0 && <span className="discount-badge">{product.discount}% OFF</span>}
      <div className="wishlist-btn" onClick={e => { e.stopPropagation(); onWishlist(); }}>
        <IonIcon icon={inWishlist ? heart : heartOutline} color={inWishlist ? 'danger' : 'medium'} />
      </div>
    </div>
    <div className="product-info">
      <p className="product-name">{product.name}</p>
      <div className="product-rating">
        <IonIcon icon={starSharp} color="warning" />
        <span>{product.rating}</span>
        <span className="review-count">({product.reviews})</span>
      </div>
      <div className="product-price">
        <span className="price">₹{product.price}</span>
        {product.originalPrice > product.price && (
          <span className="original-price">₹{product.originalPrice}</span>
        )}
      </div>
      {!product.inStock ? (
        <IonChip color="danger" style={{ fontSize: 11, height: 24 }}>Out of Stock</IonChip>
      ) : (
        <IonButton size="small" expand="block" className="add-btn" onClick={e => { e.stopPropagation(); onAddToCart(); }}>
          Add to Cart
        </IonButton>
      )}
    </div>
  </div>
);

/* ── Testimonial card with "Read more" expand ── */
const TestimonialCard: React.FC<{ testimonial: { name: string; time: string; text: string } }> = ({ testimonial }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = testimonial.text.length > 160;
  const displayText = expanded || !isLong ? testimonial.text : testimonial.text.slice(0, 160) + '...';

  return (
    <div className="testimonial-card">
      <div className="testimonial-quote">“</div>
      <p className="testimonial-text">
        {displayText}
        {isLong && (
          <span className="read-more" onClick={() => setExpanded(!expanded)}>
            {expanded ? ' Show less' : ' Read more'}
          </span>
        )}
      </p>
      <div className="testimonial-author">
        <div className="author-avatar">{testimonial.name.charAt(0)}</div>
        <div>
          <p className="author-name">{testimonial.name}</p>
          <p className="author-time">{testimonial.time}</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;