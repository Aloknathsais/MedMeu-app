import React, { useState, useRef, useEffect } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonBackButton, IonButtons,
  IonButton, IonIcon, IonBadge, IonToast, IonSpinner,
} from '@ionic/react';
import {
  heartOutline, heart, cartOutline, starSharp, starOutline, shareSocialOutline,
  shieldCheckmarkOutline, refreshOutline, carOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { productsService, UiProduct } from '../../services/products.service';
import { reviewsService, ProductReview } from '../../services/reviews.service';
import {
  QUANTITY_PRICING_TIERS,
  getActiveTier,
  getTierUnitPrice,
} from '../../utils/quantityPricing';
import './Products.css';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { state, addToCart: persistAddToCart, loadWishlist, toggleWishlist: persistToggleWishlist } = useApp();
  const [qty, setQty] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'desc' | 'spec' | 'reviews'>('desc');
  const [activeImg, setActiveImg] = useState(0);

  const [product, setProduct] = useState<UiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Reviews — separate loading state from the product itself, since a
  // reviews fetch failure shouldn't block the rest of the page.
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');

  // Write-a-review form state
  const [newRating, setNewRating] = useState(0);
  const [newReviewText, setNewReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFormError, setReviewFormError] = useState('');
  const [reviewJustSubmitted, setReviewJustSubmitted] = useState(false);

  // Swipe tracking
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  /* ── Load the real wishlist (works for guests too — see wishlist.service.ts) ── */
  useEffect(() => {
    loadWishlist().catch((err) => {
      console.error('Failed to load wishlist', err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    let cancelled = false;
    setReviewsLoading(true);
    setReviewsError('');
    // Reset the write-review form when navigating to a different product
    setNewRating(0);
    setNewReviewText('');
    setReviewJustSubmitted(false);
    reviewsService.list(id)
      .then(list => { if (!cancelled) setReviews(list); })
      .catch(err => {
        console.error('Failed to load reviews', err);
        if (!cancelled) setReviewsError('Could not load reviews right now.');
      })
      .finally(() => { if (!cancelled) setReviewsLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const submitReview = async () => {
    if (newRating < 1) {
      setReviewFormError('Please select a star rating');
      return;
    }
    if (!newReviewText.trim()) {
      setReviewFormError('Please write a few words about the product');
      return;
    }
    setSubmittingReview(true);
    setReviewFormError('');
    try {
      await reviewsService.submit(id, { rating: newRating, review: newReviewText.trim() });
      // Not appending the returned review to the visible list — new
      // reviews commonly land in moderation (WordPress comment
      // approval) before they're public, so showing it immediately
      // here would be showing something other customers can't
      // actually see yet. A clear "submitted" state is more honest
      // than a fake-looking instant appearance.
      setReviewJustSubmitted(true);
      setNewRating(0);
      setNewReviewText('');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Could not submit your review — please try again.';
      setReviewFormError(message);
    } finally {
      setSubmittingReview(false);
    }
  };

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
  const activeTier = getActiveTier(qty);

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

  const addToCart = async (): Promise<boolean> => {
    try {
      await persistAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: qty,
        unit: product.unit,
        weight: product.weight,
      });
      setToastMsg('Added to cart!');
      setShowToast(true);
      return true;
    } catch (err: any) {
      console.error('Failed to add to cart', err);
      // Real WooCommerce cart now — a failure can be a genuine
      // rejection (e.g. out of stock), not just a network hiccup.
      const message =
        err?.response?.data?.message || 'Could not add to cart — please try again.';
      setToastMsg(message);
      setShowToast(true);
      return false;
    }
  };

  const buyNow = async () => {
    const added = await addToCart();
    if (added) history.push('/tabs/cart');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="detail-toolbar">
          <IonButtons slot="start"><IonBackButton color="dark" /></IonButtons>
          <IonButtons slot="end">
            <IonButton><IonIcon icon={shareSocialOutline} color="dark" /></IonButton>
            <IonButton onClick={() => persistToggleWishlist(product.id).catch((err) => console.error('Failed to update wishlist', err))}>
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

          <div className="tier-pricing-card">
            {QUANTITY_PRICING_TIERS.map((tier) => {
              const tierPrice = getTierUnitPrice(product.price, tier.discountPercent);
              const isActive = activeTier.minQty === tier.minQty;
              return (
                <button
                  key={tier.minQty}
                  className={`tier-pricing-row ${isActive ? 'active' : ''}`}
                  onClick={() => setQty(Math.min(maxQty, tier.minQty))}
                >
                  <span className="tier-pricing-radio">
                    <span className={`tier-pricing-radio-dot ${isActive ? 'active' : ''}`} />
                  </span>
                  <span className="tier-pricing-label">{tier.label}</span>
                  <span className="tier-pricing-price">
                    {tier.discountPercent > 0 && (
                      <span className="tier-pricing-price-original">
                        ₹{product.price}
                      </span>
                    )}
                    ₹{tierPrice}
                  </span>
                </button>
              );
            })}
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

              {/* ── Write a review ── */}
              <div className="write-review-card">
                <h4 className="write-review-title">Write a review</h4>
                {reviewJustSubmitted ? (
                  <p className="review-submitted-msg">
                    Thanks! Your review has been submitted and will appear here
                    once it's approved.
                  </p>
                ) : (
                  <>
                    <div className="review-rating-picker">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          className="review-star-btn"
                          onClick={() => {
                            setNewRating(n);
                            setReviewFormError('');
                          }}
                          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
                        >
                          <IonIcon
                            icon={n <= newRating ? starSharp : starOutline}
                            color={n <= newRating ? 'warning' : 'medium'}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="review-textarea"
                      placeholder="Share your experience with this product..."
                      value={newReviewText}
                      onChange={(e) => {
                        setNewReviewText(e.target.value);
                        setReviewFormError('');
                      }}
                      rows={3}
                      maxLength={2000}
                    />
                    {reviewFormError && (
                      <p className="review-form-error">{reviewFormError}</p>
                    )}
                    <IonButton
                      expand="block"
                      className="review-submit-btn"
                      onClick={submitReview}
                      disabled={submittingReview}
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </IonButton>
                  </>
                )}
              </div>

              {/* ── Existing reviews ── */}
              <div className="review-list">
                {reviewsLoading ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <IonSpinner name="crescent" />
                  </div>
                ) : reviewsError ? (
                  <p className="review-placeholder" style={{ color: '#C62828' }}>
                    {reviewsError}
                  </p>
                ) : reviews.length === 0 ? (
                  <p className="review-placeholder">
                    No reviews yet — be the first to review this product.
                  </p>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="review-item">
                      <div className="review-item-header">
                        {r.avatarUrl && (
                          <img
                            src={r.avatarUrl}
                            alt=""
                            className="review-item-avatar"
                          />
                        )}
                        <div className="review-item-header-text">
                          <div className="review-item-top">
                            <span className="review-item-name">{r.reviewer}</span>
                            {r.verified && (
                              <span className="review-verified-badge">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="review-stars-row">
                            {[1, 2, 3, 4, 5].map(n => (
                              <IonIcon
                                key={n}
                                icon={starSharp}
                                color={n <= r.rating ? 'warning' : 'medium'}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="review-item-text">{r.reviewText}</p>
                      <p className="review-item-date">
                        {new Date(r.dateCreated).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
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