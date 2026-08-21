import React, { useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton,
  IonButtons, IonIcon, IonButton,
} from '@ionic/react';
import {
  starSharp, heartOutline, heart, optionsOutline, closeOutline,
  searchOutline, chevronDownOutline, gridOutline, listOutline,
  chevronForwardOutline, chevronDownOutline as chevronDown,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { mockProducts, mockCategories, mockSubCategories } from '../../utils/mockData';
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

const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];
const weightOptions = ['100ml', '200ml', '400ml', '500g', '1kg', '1 Unit', '1 Kit', '1 Piece'];

const ProductsPage: React.FC = () => {
  const history = useHistory();
  const { state, dispatch } = useApp();
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
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);

  const addToCart = (product: any, e: any) => {
    e.stopPropagation();
    dispatch({ type: 'ADD_TO_CART', payload: { id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1, unit: product.unit } });
  };

  const toggleWishlist = (id: string, e: any) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_WISHLIST', payload: id });
  };

  const toggleSize = (s: string) => setSelectedSizes(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleWeight = (w: string) => setSelectedWeights(p => p.includes(w) ? p.filter(x => x !== w) : [...p, w]);

  const resetFilters = () => {
    setPriceRange([0, 5000]);
    setInStockOnly(false);
    setMinDiscount(0);
    setSelectedSizes([]);
    setSelectedWeights([]);
  };

  // Handle category chip tap
  const handleCatTap = (catId: string) => {
    const cat = mockCategories.find(c => c.id === catId);
    if (catId === 'all') {
      setSelectedCat('all');
      setExpandedCat(null);
      setSelectedSubCat(null);
      return;
    }
    if (cat?.hasSubCategories && mockSubCategories[catId]) {
      // Toggle expand; if already expanded, collapse
      if (expandedCat === catId) {
        setExpandedCat(null);
        setSelectedSubCat(null);
      } else {
        setExpandedCat(catId);
        setSelectedCat(catId);
        setSelectedSubCat(null);
      }
    } else {
      // No subcategories — select directly
      setSelectedCat(catId);
      setExpandedCat(null);
      setSelectedSubCat(null);
    }
  };

  // Handle subcategory tap
  const handleSubCatTap = (subId: string) => {
    setSelectedSubCat(prev => prev === subId ? null : subId);
  };

  // Filter products
  let filtered = mockProducts
    .filter(p => {
      if (selectedCat === 'all') return true;
      if (p.category !== selectedCat) return false;
      return true;
    })
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .filter(p => !inStockOnly || p.inStock)
    .filter(p => minDiscount === 0 || p.discount >= minDiscount)
    .filter(p => selectedWeights.length === 0 || selectedWeights.includes(p.unit));

  if (sort === 'price_asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sort === 'rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  const activeFilterCount =
    (inStockOnly ? 1 : 0) +
    (priceRange[1] < 5000 ? 1 : 0) +
    (minDiscount > 0 ? 1 : 0) +
    (selectedSizes.length > 0 ? 1 : 0) +
    (selectedWeights.length > 0 ? 1 : 0);

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

        {/* ── Category chips with inline subcategory tree ── */}
        <div className="cat-chips-section">
          <div className="cat-chips">
            {/* All chip */}
            <button
              className={`cat-chip ${selectedCat === 'all' ? 'active' : ''}`}
              onClick={() => handleCatTap('all')}
            >
              All
            </button>

            {mockCategories.map(cat => {
              const isSelected = selectedCat === cat.id;
              const isExpanded = expandedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  className={`cat-chip ${isSelected ? 'active' : ''} ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => handleCatTap(cat.id)}
                >
                  <span className="cat-chip-emoji">{cat.icon}</span>
                  {cat.name}
                  {cat.hasSubCategories && (
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
          {expandedCat && mockSubCategories[expandedCat] && (
            <div className="subcat-tree-panel">
              <div className="subcat-tree-header">
                <span className="subcat-tree-label">
                  {mockCategories.find(c => c.id === expandedCat)?.icon}{' '}
                  {mockCategories.find(c => c.id === expandedCat)?.name}
                </span>
                <span className="subcat-tree-all"
                  onClick={() => { setSelectedSubCat(null); setSelectedCat(expandedCat); }}>
                  View All
                </span>
              </div>
              <div className="subcat-tree-items">
                {mockSubCategories[expandedCat].map(sub => {
                  const isSubSelected = selectedSubCat === sub.id;
                  return (
                    <button
                      key={sub.id}
                      className={`subcat-tree-item ${isSubSelected ? 'active' : ''}`}
                      onClick={() => handleSubCatTap(sub.id)}
                    >
                      <span className="subcat-tree-icon">{sub.icon}</span>
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
            <span>
              {mockSubCategories[expandedCat!]?.find(s => s.id === selectedSubCat)?.icon}{' '}
              {mockSubCategories[expandedCat!]?.find(s => s.id === selectedSubCat)?.name}
            </span>
            <button onClick={() => setSelectedSubCat(null)}>✕ Clear</button>
          </div>
        )}

        {/* ── Active filter pills ── */}
        {activeFilterCount > 0 && (
          <div className="active-filters">
            {priceRange[1] < 5000 && <span className="active-filter-pill">Under ₹{priceRange[1]} <button onClick={() => setPriceRange([0, 5000])}>×</button></span>}
            {minDiscount > 0 && <span className="active-filter-pill">{minDiscount}%+ Off <button onClick={() => setMinDiscount(0)}>×</button></span>}
            {inStockOnly && <span className="active-filter-pill">In Stock <button onClick={() => setInStockOnly(false)}>×</button></span>}
            {selectedSizes.map(s => <span key={s} className="active-filter-pill">Size: {s} <button onClick={() => toggleSize(s)}>×</button></span>)}
            {selectedWeights.map(w => <span key={w} className="active-filter-pill">{w} <button onClick={() => toggleWeight(w)}>×</button></span>)}
            <button className="clear-all-btn" onClick={resetFilters}>Clear All</button>
          </div>
        )}

        <p className="result-count">{filtered.length} {filtered.length === 1 ? 'product' : 'products'} found</p>

        {/* ── Products ── */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span>🔍</span>
            <h3>No products found</h3>
            <p>Try adjusting filters or search terms</p>
            <IonButton size="small" fill="outline" onClick={resetFilters}>Clear all filters</IonButton>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="products-grid-view">
            {filtered.map(product => (
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
                  <p className="grid-brand">{product.brand}</p>
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
                  <p className="grid-unit">{product.unit}</p>
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
            {filtered.map(product => (
              <div key={product.id} className="product-list-card" onClick={() => history.push(`/product/${product.id}`)}>
                <img src={product.image} alt={product.name} className="list-img" loading="lazy" />
                <div className="list-info">
                  <p className="list-brand">{product.brand}</p>
                  <p className="list-name">{product.name}</p>
                  <div className="list-rating">
                    <IonIcon icon={starSharp} color="warning" style={{ fontSize: 13 }} />
                    <span>{product.rating} ({product.reviews})</span>
                  </div>
                  <p className="list-unit-tag">{product.unit}</p>
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

      {/* Filter Sheet */}
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
              <p className="filter-label">Size</p>
              <div className="size-chips">
                {sizeOptions.map(size => (
                  <button key={size} className={`size-chip ${selectedSizes.includes(size) ? 'active' : ''}`} onClick={() => toggleSize(size)}>{size}</button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <p className="filter-label">Weight / Unit</p>
              <div className="filter-option-grid">
                {weightOptions.map(w => (
                  <button key={w} className={`filter-option-chip ${selectedWeights.includes(w) ? 'active' : ''}`} onClick={() => toggleWeight(w)}>{w}</button>
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
              <button className="sheet-btn-solid" onClick={() => setShowFilterSheet(false)}>Show {filtered.length} Results</button>
            </div>
          </div>
        </div>
      )}
    </IonPage>
  );
};
export default ProductsPage;