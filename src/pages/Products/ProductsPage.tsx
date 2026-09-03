import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton,
  IonButtons, IonIcon, IonButton, IonSpinner,
} from '@ionic/react';
import {
  starSharp, heartOutline, heart, optionsOutline, closeOutline,
  searchOutline, chevronDownOutline, gridOutline, listOutline,
  chevronForwardOutline, chevronDownOutline as chevronDown,
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { productsService, UiProduct } from '../../services/products.service';
import { categoriesService, CategoryTree } from '../../services/categories.service';
import './Products.css';

const sortOptions = [
  { value: 'popular', label: 'Popularity' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest First' },
];

const discountOptions = [
  { label: 'Any Discount', value: 0 },
  { label: '10% & above', value: 10 },
  { label: '20% & above', value: 20 },
  { label: '30% & above', value: 30 },
];

const PER_PAGE = 20;

const ProductsPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { state, dispatch, addToCart: persistAddToCart } = useApp();

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');
  const [selectedCat, setSelectedCat] = useState('all');
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [selectedSubCat, setSelectedSubCat] = useState<string | null>(null);
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minDiscount, setMinDiscount] = useState(0);

  // Real categories (with real WooCommerce parent/child hierarchy).
  const [categoryTree, setCategoryTree] = useState<CategoryTree>({ topLevel: [], childrenByParent: {} });

  // Real products + pagination.
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const requestIdRef = useRef(0);

  /* Pick up ?cat=<id> or ?on_sale=1 if arriving from Home's "See All" / "View All" links. */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    if (cat) setSelectedCat(cat);
  }, [location.search]);

  /* ── Load category tree once ── */
  useEffect(() => {
    categoriesService.getTree()
      .then(setCategoryTree)
      .catch(err => console.error('Failed to load categories', err));
  }, []);

  const addToCart = (product: UiProduct, e: any) => {
    e.stopPropagation();
    persistAddToCart({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1, unit: product.unit }).catch((err) => {
      console.error('Failed to add to cart', err);
    });
  };

  const toggleWishlist = (id: string, e: any) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_WISHLIST', payload: id });
  };

  const resetFilters = () => {
    setPriceRange([0, 5000]);
    setInStockOnly(false);
    setMinDiscount(0);
  };

  /* ── Fetch products from the real backend ── */
  const fetchProducts = useCallback(async (pageToFetch: number, append: boolean) => {
    const thisRequestId = ++requestIdRef.current;
    if (append) setLoadingMore(true); else setLoading(true);

    const orderby =
      sort === 'price_asc' || sort === 'price_desc' ? 'price'
      : sort === 'rating' ? 'rating'
      : sort === 'newest' ? 'date'
      : 'popularity';
    const order =
      sort === 'price_asc' ? 'asc'
      : sort === 'price_desc' || sort === 'newest' ? 'desc'
      : undefined;

    try {
      const result = await productsService.list({
        page: pageToFetch,
        per_page: PER_PAGE,
        search: search.trim() || undefined,
        category: selectedSubCat || (selectedCat !== 'all' ? selectedCat : undefined),
        min_price: priceRange[0] || undefined,
        max_price: priceRange[1] < 5000 ? priceRange[1] : undefined,
        stock_status: inStockOnly ? 'instock' : undefined,
        orderby,
        order,
      });
      // Ignore results from a stale, superseded request (e.g. user changed filters again mid-flight).
      if (thisRequestId !== requestIdRef.current) return;

      setProducts(prev => (append ? [...prev, ...result.products] : result.products));
      setPage(result.page);
      setTotalPages(result.totalPages);
      setTotal(result.total);
      setLoadError(false);
    } catch (err) {
      console.error('Failed to load products', err);
      if (thisRequestId === requestIdRef.current) setLoadError(true);
    } finally {
      if (thisRequestId === requestIdRef.current) { setLoading(false); setLoadingMore(false); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort, selectedCat, selectedSubCat, priceRange, inStockOnly]);

  /* Re-fetch (from page 1) whenever a filter/sort/search/category changes — debounced. */
  useEffect(() => {
    const t = setTimeout(() => fetchProducts(1, false), 350);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const loadMore = () => {
    if (page < totalPages && !loadingMore) fetchProducts(page + 1, true);
  };

  // Discount has no WooCommerce list-filter equivalent — applied client-side
  // on top of whatever page(s) are currently loaded, not the whole catalog.
  const displayedProducts = minDiscount === 0
    ? products
    : products.filter(p => p.discount >= minDiscount);

  // Handle category chip tap
  const handleCatTap = (catId: string) => {
    if (catId === 'all') {
      setSelectedCat('all');
      setExpandedCat(null);
      setSelectedSubCat(null);
      return;
    }
    const hasSubCategories = (categoryTree.childrenByParent[catId]?.length || 0) > 0;
    if (hasSubCategories) {
      if (expandedCat === catId) {
        setExpandedCat(null);
        setSelectedSubCat(null);
      } else {
        setExpandedCat(catId);
        setSelectedCat(catId);
        setSelectedSubCat(null);
      }
    } else {
      setSelectedCat(catId);
      setExpandedCat(null);
      setSelectedSubCat(null);
    }
  };

  const handleSubCatTap = (subId: string) => {
    setSelectedSubCat(prev => prev === subId ? null : subId);
  };

  const activeFilterCount =
    (inStockOnly ? 1 : 0) +
    (priceRange[1] < 5000 ? 1 : 0) +
    (minDiscount > 0 ? 1 : 0);

  const expandedCatName = categoryTree.topLevel.find(c => c.id === expandedCat)?.name;
  const selectedSubCatName = expandedCat
    ? categoryTree.childrenByParent[expandedCat]?.find(s => s.id === selectedSubCat)?.name
    : undefined;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/tabs/home" /></IonButtons>
          <IonTitle>All Products</IonTitle>
        </IonToolbar>
        <IonToolbar className="products-search-toolbar">
          <div className="products-search-wrap">
            <IonIcon icon={searchOutline} className="products-search-icon" />
            <input
              className="products-search-input"
              placeholder="Search products, brands..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <IonIcon icon={closeOutline} className="products-search-clear" onClick={() => setSearch('')} />}
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>

        {/* ── Category chips with inline subcategory tree (real WooCommerce hierarchy) ── */}
        <div className="cat-chips-section">
          <div className="cat-chips">
            <button
              className={`cat-chip ${selectedCat === 'all' ? 'active' : ''}`}
              onClick={() => handleCatTap('all')}
            >
              All
            </button>

            {categoryTree.topLevel.map(cat => {
              const isSelected = selectedCat === cat.id;
              const isExpanded = expandedCat === cat.id;
              const hasSubCategories = (categoryTree.childrenByParent[cat.id]?.length || 0) > 0;
              return (
                <button
                  key={cat.id}
                  className={`cat-chip ${isSelected ? 'active' : ''} ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => handleCatTap(cat.id)}
                >
                  <span className="cat-chip-emoji">{cat.name.charAt(0).toUpperCase()}</span>
                  {cat.name}
                  {hasSubCategories && (
                    <IonIcon
                      icon={isExpanded ? chevronDown : chevronForwardOutline}
                      className="cat-chip-arrow"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Inline subcategory tree panel ── */}
          {expandedCat && categoryTree.childrenByParent[expandedCat] && (
            <div className="subcat-tree-panel">
              <div className="subcat-tree-header">
                <span className="subcat-tree-label">{expandedCatName}</span>
                <span className="subcat-tree-all"
                  onClick={() => { setSelectedSubCat(null); setSelectedCat(expandedCat); }}>
                  View All
                </span>
              </div>
              <div className="subcat-tree-items">
                {categoryTree.childrenByParent[expandedCat].map(sub => {
                  const isSubSelected = selectedSubCat === sub.id;
                  return (
                    <button
                      key={sub.id}
                      className={`subcat-tree-item ${isSubSelected ? 'active' : ''}`}
                      onClick={() => handleSubCatTap(sub.id)}
                    >
                      <span className="subcat-tree-icon">{sub.name.charAt(0).toUpperCase()}</span>
                      <span className="subcat-tree-name">{sub.name}</span>
                      <span className="subcat-tree-count">{sub.count}</span>
                      {isSubSelected && <span className="subcat-check">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Sort / Filter / View toolbar ── */}
        <div className="toolbar-row">
          <button className="toolbar-btn" onClick={() => setShowSortSheet(true)}>
            Sort: <strong>{sortOptions.find(s => s.value === sort)?.label}</strong>
            <IonIcon icon={chevronDownOutline} />
          </button>
          <button className="toolbar-btn" onClick={() => setShowFilterSheet(true)}>
            <IonIcon icon={optionsOutline} />
            Filter
            {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
          </button>
          <button className="view-toggle-btn" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            <IonIcon icon={viewMode === 'grid' ? listOutline : gridOutline} />
          </button>
        </div>

        {/* ── Active subcategory indicator ── */}
        {selectedSubCat && (
          <div className="active-subcat-bar">
            <span>{selectedSubCatName}</span>
            <button onClick={() => setSelectedSubCat(null)}>✕ Clear</button>
          </div>
        )}

        {/* ── Active filter pills ── */}
        {activeFilterCount > 0 && (
          <div className="active-filters">
            {priceRange[1] < 5000 && <span className="active-filter-pill">Under ₹{priceRange[1]} <button onClick={() => setPriceRange([0, 5000])}>×</button></span>}
            {minDiscount > 0 && <span className="active-filter-pill">{minDiscount}%+ Off <button onClick={() => setMinDiscount(0)}>×</button></span>}
            {inStockOnly && <span className="active-filter-pill">In Stock <button onClick={() => setInStockOnly(false)}>×</button></span>}
            <button className="clear-all-btn" onClick={resetFilters}>Clear All</button>
          </div>
        )}

        {!loading && (
          <p className="result-count">{total} {total === 1 ? 'product' : 'products'} found</p>
        )}

        {/* ── Products ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
            <IonSpinner name="crescent" />
            <p>Loading products...</p>
          </div>
        ) : loadError && products.length === 0 ? (
          <div className="empty-state">
            <span>⚠️</span>
            <h3>Couldn't load products</h3>
            <p>Check your connection and try again.</p>
            <IonButton size="small" fill="outline" onClick={() => fetchProducts(1, false)}>Retry</IonButton>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="empty-state">
            <span>🔍</span>
            <h3>No products found</h3>
            <p>Try adjusting filters or search terms</p>
            <IonButton size="small" fill="outline" onClick={resetFilters}>Clear all filters</IonButton>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="products-grid-view">
            {displayedProducts.map(product => (
              <div key={product.id} className="grid-card" onClick={() => history.push(`/product/${product.id}`)}>
                <div className="grid-img-wrap">
                  <img src={product.image} alt={product.name} loading="lazy" />
                  {product.discount > 0 && <span className="grid-discount">{product.discount}% OFF</span>}
                  <div className="grid-wishlist" onClick={e => toggleWishlist(product.id, e)}>
                    <IonIcon icon={state.wishlist.includes(product.id) ? heart : heartOutline}
                      color={state.wishlist.includes(product.id) ? 'danger' : 'medium'} />
                  </div>
                </div>
                <div className="grid-info">
                  <p className="grid-name">{product.name}</p>
                  <div className="grid-rating">
                    <IonIcon icon={starSharp} color="warning" />
                    <span>{product.rating}</span>
                    <span className="grid-reviews">({product.reviews})</span>
                  </div>
                  <div className="grid-price-row">
                    <span className="grid-price">₹{product.price}</span>
                    {product.originalPrice > product.price && <span className="grid-original">₹{product.originalPrice}</span>}
                  </div>
                  {product.inStock ? (
                    <button className="grid-add-btn" onClick={e => addToCart(product, e)}>Add to Cart</button>
                  ) : (
                    <span className="grid-oos">Out of Stock</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="products-list">
            {displayedProducts.map(product => (
              <div key={product.id} className="product-list-card" onClick={() => history.push(`/product/${product.id}`)}>
                <img src={product.image} alt={product.name} className="list-img" loading="lazy" />
                <div className="list-info">
                  <p className="list-name">{product.name}</p>
                  <div className="list-rating">
                    <IonIcon icon={starSharp} color="warning" style={{ fontSize: 13 }} />
                    <span>{product.rating} ({product.reviews})</span>
                  </div>
                  <div className="list-price">
                    <span className="price">₹{product.price}</span>
                    {product.originalPrice > product.price && <span className="original-price">₹{product.originalPrice}</span>}
                    {product.discount > 0 && <span className="list-discount">{product.discount}% OFF</span>}
                  </div>
                  {product.inStock ? (
                    <button className="list-add-btn" onClick={e => addToCart(product, e)}>Add to Cart</button>
                  ) : (
                    <span className="list-oos">Out of Stock</span>
                  )}
                </div>
                <div className="list-wishlist" onClick={e => toggleWishlist(product.id, e)}>
                  <IonIcon icon={state.wishlist.includes(product.id) ? heart : heartOutline}
                    color={state.wishlist.includes(product.id) ? 'danger' : 'medium'} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Load more (real pagination) ── */}
        {!loading && !loadError && page < totalPages && minDiscount === 0 && (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <IonButton fill="outline" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? <IonSpinner name="crescent" /> : `Load More (${total - products.length} remaining)`}
            </IonButton>
          </div>
        )}

        <div style={{ height: 24 }} />
      </IonContent>

      {/* Sort Sheet */}
      {showSortSheet && (
        <div className="sheet-overlay" onClick={() => setShowSortSheet(false)}>
          <div className="sheet-panel" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <h3>Sort By</h3>
              <IonIcon icon={closeOutline} onClick={() => setShowSortSheet(false)} />
            </div>
            {sortOptions.map(opt => (
              <button key={opt.value} className={`sheet-option ${sort === opt.value ? 'selected' : ''}`}
                onClick={() => { setSort(opt.value); setShowSortSheet(false); }}>
                {opt.label}
                {sort === opt.value && <span className="check-dot" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Sheet
          Note: Size and Weight/Unit filters were removed — WooCommerce
          products (via the backend adapter) don't carry a "size" or
          "unit" field, so those filters would always match nothing
          against real data. Re-add them once that's backed by real
          WooCommerce product attributes. */}
      {showFilterSheet && (
        <div className="sheet-overlay" onClick={() => setShowFilterSheet(false)}>
          <div className="sheet-panel" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <h3>Filters</h3>
              <IonIcon icon={closeOutline} onClick={() => setShowFilterSheet(false)} />
            </div>
            <div className="filter-group">
              <p className="filter-label">Price Range: ₹{priceRange[0]} – ₹{priceRange[1]}</p>
              <input type="range" min={0} max={5000} step={100} value={priceRange[1]}
                onChange={e => setPriceRange([0, Number(e.target.value)])} className="price-slider" />
              <div className="price-presets">
                {[500, 1000, 2000, 5000].map(p => (
                  <button key={p} className={`preset-chip ${priceRange[1] === p ? 'active' : ''}`} onClick={() => setPriceRange([0, p])}>Under ₹{p}</button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <p className="filter-label">Minimum Discount</p>
              <div className="filter-option-grid">
                {discountOptions.map(opt => (
                  <button key={opt.value} className={`filter-option-chip ${minDiscount === opt.value ? 'active' : ''}`} onClick={() => setMinDiscount(opt.value)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <label className="checkbox-row">
                <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
                <span>In Stock Only</span>
              </label>
            </div>
            <div className="sheet-actions">
              <button className="sheet-btn-outline" onClick={resetFilters}>Reset All</button>
              <button className="sheet-btn-solid" onClick={() => setShowFilterSheet(false)}>Show {displayedProducts.length} Results</button>
            </div>
          </div>
        </div>
      )}
    </IonPage>
  );
};
export default ProductsPage;