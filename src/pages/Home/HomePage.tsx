import React, { useState, useRef, useEffect } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar,
  IonBadge, IonIcon, IonRefresher, IonRefresherContent,
  IonButton, IonChip, IonMenuButton,
} from '@ionic/react';
import {
  cartOutline, notificationsOutline, heartOutline, heart,
  starSharp, searchOutline, closeOutline, arrowForward, menuOutline,
  logoWhatsapp,
  logoInstagram,
  logoFacebook,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { mockBanners, mockTestimonials, mockTrustBadges } from '../../utils/mockData';
import { productsService, UiProduct } from '../../services/products.service';
import { categoriesService, UiCategory } from '../../services/categories.service';
import { authService } from '../../services/auth.service';
import Logo from '../../assets/logo.png';
import './Home.css';

const HomePage: React.FC = () => {
  const history = useHistory();
  const { state, dispatch, addToCart: persistAddToCart } = useApp();
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);

  // Real data — replaces mockCategories/mockProducts.
  const [categories, setCategories] = useState<UiCategory[]>([]);
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [deals, setDeals] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Backend-search results shown while the search bar is open.
  const [searchResults, setSearchResults] = useState<UiProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const bannerScrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Focus search input when search bar opens */
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 150);
    }
  }, [searchOpen]);

  /* ── Load real dashboard data: categories + home products + on-sale deals ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, feat, sale] = await Promise.all([
          categoriesService.list(),
          productsService.getHomeProducts(8),
          productsService.getOnSale(6),
        ]);
        if (cancelled) return;
        setCategories(cats);
        setProducts(feat);
        setDeals(sale);
        setLoadError(false);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /**
   * Revalidate the logged-in session against the backend rather than
   * trusting the cached localStorage user indefinitely — if the token
   * has expired/been revoked, api.ts's 401 interceptor already handles
   * clearing it and redirecting to /login; this just makes sure the
   * profile shown is current when the session IS still valid.
   */
  useEffect(() => {
    if (!state.isAuthenticated) return;
    authService.getMe()
      .then(user => dispatch({ type: 'SET_USER', payload: user }))
      .catch(() => { /* 401 case already handled globally by api.ts */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isAuthenticated]);

  /* ── Debounced backend search while the search bar is open ── */
  useEffect(() => {
    if (!searchOpen || !search.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    const t = setTimeout(async () => {
      try {
        const results = await productsService.search(search, 20);
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search, searchOpen]);

  /* Auto-scroll banner every 4s, resets when activeBanner changes */
  useEffect(() => {
    if (loading) return;
    autoScrollRef.current = setInterval(() => {
      const el = bannerScrollRef.current;
      if (!el) return;
      const next = (activeBanner + 1) % mockBanners.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
      setActiveBanner(next);
    }, 4000);
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [loading, activeBanner]);

  const addToCart = (product: UiProduct) => {
    persistAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      unit: product.unit,
    }).catch((err) => {
      console.error('Failed to add to cart', err);
    });
  };

  const toggleWishlist = (id: string) => dispatch({ type: 'TOGGLE_WISHLIST', payload: id });

  const handleRefresh = async (e: any) => {
    try {
      const [cats, feat, sale] = await Promise.all([
        categoriesService.list(),
        productsService.getHomeProducts(8),
        productsService.getOnSale(6),
      ]);
      setCategories(cats);
      setProducts(feat);
      setDeals(sale);
      setLoadError(false);
    } catch (err) {
      console.error('Refresh failed', err);
      setLoadError(true);
    } finally {
      e.detail.complete();
    }
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

  /* Pause auto-scroll when user manually interacts with banner */
  const pauseAutoScroll = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
  };

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
          /* ── Search results view (real backend search, debounced) ── */
          <>
            {searchLoading ? (
              <ProductsSkeleton />
            ) : (
              <>
                <p className="result-count">{searchResults.length} results for "{search}"</p>
                {searchResults.length === 0 ? (
                  <div className="empty-state">
                    <span>🔍</span>
                    <p>No products found for "{search}"</p>
                  </div>
                ) : (
                  <div className="products-grid">
                    {searchResults.map(product => (
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
            )}
          </>
        ) : (
          <>
            {/* ── Offer Banner Carousel ──
                Still mock: banners are marketing content (image + copy +
                CTA), not catalog data — WooCommerce has nothing that maps
                to this. Would need a simple CMS/custom endpoint later. */}
            {loading ? (
              <BannerSkeleton />
            ) : (
              <div className="banner-section">
                <div
                  className="banner-slider"
                  ref={bannerScrollRef}
                  onScroll={handleBannerScroll}
                  onTouchStart={pauseAutoScroll}
                  onMouseDown={pauseAutoScroll}
                >
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
            )}

            {/* ── Categories (real) ── */}
            <div className="section-header">
              <h2>Shop by Category</h2>
              <span onClick={() => history.push('/tabs/products')}>See All</span>
            </div>
            {loadError && categories.length === 0 ? (
              <p className="result-count">Couldn't load categories right now.</p>
            ) : (
              <div className="category-grid">
                {categories.slice(0, 12).map(cat => (
                  <div
                    key={cat.id}
                    className="category-item"
                    onClick={() => history.push(`/tabs/products?cat=${cat.id}`)}
                  >
                    <div className="category-icon">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                      ) : (
                        <span>{cat.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <p className="category-name">{cat.name}</p>
                    <span className="category-count">{cat.count} items</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Offer Zone (real on-sale products) ──
                Price, discount %, and title are real WooCommerce data.
                Color/emoji/tag are decorative-only (no per-product data
                backs them, so they just rotate through a fixed set) and
                the countdown timer is omitted entirely rather than shown
                with a fake end-time — see DealCard below. */}
            {deals.length > 0 && (
              <>
                <div className="section-header">
                  <h2>🔥 Offer Zone</h2>
                  <span onClick={() => history.push('/tabs/products?on_sale=1')}>View All</span>
                </div>
                <div className="deals-scroll">
                  {deals.map((product, i) => (
                    <DealCard
                      key={product.id}
                      deal={mapProductToDeal(product, i)}
                      onPress={() => history.push(`/product/${product.id}`)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* ── Featured Products (real) ── */}
            <div className="section-header">
              <h2>Featured Products</h2>
              <span onClick={() => history.push('/tabs/products')}>See All</span>
            </div>
            {loading ? (
              <ProductsSkeleton />
            ) : loadError && products.length === 0 ? (
              <p className="result-count">Couldn't load products right now. Pull to refresh.</p>
            ) : (
              <div className="products-grid">
                {products.map(product => (
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

            {/* ── Testimonials — still mock, no backend source for these ── */}
            <div className="section-header">
              <h2>What Our Customers Say About Us</h2>
            </div>
            <div className="testimonial-slider">
              {mockTestimonials.map((t, i) => (
                <TestimonialCard key={i} testimonial={t} />
              ))}
            </div>

            {/* ── Trust Badges — still mock, static marketing copy ── */}
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

            {/* ── App Footer ── */}
            <div className="app-footer">
              

              <div className="footer-social-row">
                <a href="https://wa.me/919876543210" className="social-icon-btn whatsapp"><IonIcon icon={logoWhatsapp} /></a>
                <a href="#" className="social-icon-btn instagram"><IonIcon icon={logoInstagram} /></a>
                <a href="#" className="social-icon-btn facebook"><IonIcon icon={logoFacebook} /></a>
              </div>

              <div className="footer-secure-badge">
                <IonIcon icon={shieldCheckmarkOutline} />
                <span>100% Secure Payments & Verified Sellers</span>
              </div>

              <div className="footer-logo-watermark">
                <img src={Logo} alt="Medmeu" />
              </div>

              {/* <p className="footer-copyright">© {new Date().getFullYear()} Medmeu. All rights reserved.</p> */}
            </div>
          </>
        )}
        {/* <div style={{ height: 24 }} /> */}
      </IonContent>
    </IonPage>
  );
};

/* ── Skeleton: banner placeholder ── */
const BannerSkeleton: React.FC = () => (
  <div className="banner-section">
    <div className="skeleton-banner" />
    <div className="banner-dots">
      <span className="banner-dot active" />
      <span className="banner-dot" />
      <span className="banner-dot" />
    </div>
  </div>
);

/* ── Skeleton: product grid placeholders ── */
const ProductsSkeleton: React.FC = () => (
  <div className="products-grid">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="skeleton-product-card">
        <div className="skeleton-img" />
        <div className="skeleton-body">
          <div className="skeleton-line w-80" />
          <div className="skeleton-line w-50" />
          <div className="skeleton-line w-60" />
          <div className="skeleton-btn" />
        </div>
      </div>
    ))}
  </div>
);

/* ── Reusable product card ── */
const ProductCard: React.FC<{
  product: UiProduct;
  badge?: { label: string; type: 'new' | 'bestseller' };
  inWishlist: boolean;
  onCardClick: () => void;
  onWishlist: () => void;
  onAddToCart: () => void;
}> = ({ product, badge, inWishlist, onCardClick, onWishlist, onAddToCart }) => (
  <div className="product-card" onClick={onCardClick}>
    <div className="product-img-wrap">
      <img src={product.image} alt={product.name} loading="lazy" />
      {product.discount > 0 && (
        <span className="discount-badge">{product.discount}% OFF</span>
      )}
      {badge && (
        <span className={`product-ribbon ribbon-${badge.type}`}>{badge.label}</span>
      )}
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
        <IonButton
          size="small"
          expand="block"
          className="add-btn"
          onClick={e => { e.stopPropagation(); onAddToCart(); }}
        >
          Add to Cart
        </IonButton>
      )}
    </div>
  </div>
);

/* ── Testimonial card with "Read more" expand ── */
const TestimonialCard: React.FC<{
  testimonial: { name: string; time: string; text: string };
}> = ({ testimonial }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = testimonial.text.length > 160;
  const displayText =
    expanded || !isLong ? testimonial.text : testimonial.text.slice(0, 160) + '...';

  return (
    <div className="testimonial-card">
      <div className="testimonial-quote">"</div>
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

/* ── Countdown timer hook — returns null (no timer) when no end-time is given ── */
const useCountdown = (initial?: string) => {
  const [time, setTime] = useState<string | null>(initial ?? null);
  useEffect(() => {
    if (!initial) return;
    const tick = setInterval(() => {
      setTime(prev => {
        const [h, m, s] = (prev ?? initial).split(':').map(Number);
        let total = h * 3600 + m * 60 + s - 1;
        if (total <= 0) { clearInterval(tick); return '00:00:00'; }
        const hh = String(Math.floor(total / 3600)).padStart(2, '0');
        const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
        const ss = String(total % 60).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [initial]);
  return time;
};

/* Truncates a string to `max` chars, appending "..." only when it was actually cut */
const truncate = (str: string, max: number) =>
  str.length > max ? `${str.slice(0, max)}...` : str;

/* Darkens a hex color by a given amount, used to build the deal-card gradient */
const darkenColor = (hex: string, amount: number) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

/* ── Single deal card — premium voucher/ticket style with live countdown ── */
const DealCard: React.FC<{ deal: any; onPress: () => void }> = ({ deal, onPress }) => {
  const time = useCountdown(deal.endsIn);
  return (
    <div className="deal-card" onClick={onPress}>
      <div
        className="deal-card-header"
        style={{ background: `linear-gradient(135deg, ${deal.color} 0%, ${darkenColor(deal.color, 45)} 100%)` }}
      >
        <span className="deal-emoji-bg">{deal.emoji}</span>
        <div className="deal-card-top">
          <span className="deal-tag">{deal.tag}</span>
          <div className="deal-discount-pill">
            <span>{deal.discount}%</span>
            <span>OFF</span>
          </div>
        </div>
        <p className="deal-title">{truncate(deal.title, 40)}</p>
      </div>

      <div className="deal-ticket-divider">
        <span className="deal-notch deal-notch-left" />
        <span className="deal-dashes" />
        <span className="deal-notch deal-notch-right" />
      </div>

      <div className="deal-card-body">
        <p className="deal-desc">{truncate(deal.description, 100)}</p>
        <div className="deal-card-bottom">
          <div className="deal-price-row">
            <span className="deal-price">₹{deal.dealPrice}</span>
            <span className="deal-original">₹{deal.originalPrice}</span>
          </div>
          <div className="deal-timer">
            {time && <span className="timer-label">⏱ {time}</span>}
          </div>
        </div>
        <button className="deal-btn" style={{ background: deal.color }}>
          Grab Deal <IonIcon icon={arrowForward} />
        </button>
      </div>
    </div>
  );
};

/**
 * Adapts a real UiProduct into the shape <DealCard> expects.
 * REAL: title, discount, dealPrice, originalPrice, description.
 * DECORATIVE ONLY (no product data backs these — just cycled for visual
 * variety, not meant to imply per-product meaning): color, emoji, tag.
 * endsIn is intentionally omitted — there's no real deal-expiry data in
 * WooCommerce, so DealCard shows no countdown at all rather than a fake one.
 */
const DEAL_COLORS = ['#2171a8', '#f4621d', '#2E7D32', '#C62828', '#7B1FA2', '#00838F'];
const DEAL_EMOJIS = ['💊', '🩺', '🧴', '💉', '🧪', '🩹'];

function mapProductToDeal(product: UiProduct, index: number) {
  return {
    id: product.id,
    title: product.name,
    description: product.shortDescription || 'Limited-time price on this item.',
    discount: product.discount,
    dealPrice: product.price,
    originalPrice: product.originalPrice,
    tag: 'On Sale',
    color: DEAL_COLORS[index % DEAL_COLORS.length],
    emoji: DEAL_EMOJIS[index % DEAL_EMOJIS.length],
    endsIn: undefined as string | undefined,
  };
}

export default HomePage;