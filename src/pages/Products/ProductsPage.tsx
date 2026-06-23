import React, { useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton,
  IonButtons, IonIcon, IonButton, IonSpinner,
} from '@ionic/react';
import {
  starSharp, heartOutline, heart, optionsOutline, closeOutline,
  searchOutline, chevronDownOutline, gridOutline, listOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { mockProducts, mockCategories } from '../../utils/mockData';
import './Products.css';

const sortOptions = [
  { value: 'popular', label: 'Popularity' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest First' },
];

const ProductsPage: React.FC = () => {
  const history = useHistory();
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');
  const [selectedCat, setSelectedCat] = useState('all');
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const addToCart = (product: any, e: any) => {
    e.stopPropagation();
    dispatch({ type: 'ADD_TO_CART', payload: { id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1, unit: product.unit } });
  };

  const toggleWishlist = (id: string, e: any) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_WISHLIST', payload: id });
  };

  let filtered = mockProducts
    .filter(p => selectedCat === 'all' || p.category === selectedCat)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .filter(p => !inStockOnly || p.inStock);

  if (sort === 'price_asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sort === 'rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  const activeFilterCount = (inStockOnly ? 1 : 0) + (priceRange[1] < 5000 ? 1 : 0);

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
        {/* Category chips */}
        <div className="cat-chips">
          <button className={`cat-chip ${selectedCat === 'all' ? 'active' : ''}`} onClick={() => setSelectedCat('all')}>
            All
          </button>
          {mockCategories.map(c => (
            <button key={c.id} className={`cat-chip ${selectedCat === c.id ? 'active' : ''}`} onClick={() => setSelectedCat(c.id)}>
              <span className="cat-chip-emoji">{c.icon}</span> {c.name}
            </button>
          ))}
        </div>

        {/* Sort / Filter / View toolbar */}
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

        <p className="result-count">{filtered.length} {filtered.length === 1 ? 'product' : 'products'} found</p>

        {/* Product list/grid */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span>🔍</span>
            <h3>No products found</h3>
            <p>Try adjusting filters or search terms</p>
            <IonButton size="small" fill="outline" onClick={() => { setSelectedCat('all'); setSearch(''); setInStockOnly(false); setPriceRange([0, 5000]); }}>
              Clear all filters
            </IonButton>
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

      {/* Sort Bottom Sheet */}
      {showSortSheet && (
        <div className="sheet-overlay" onClick={() => setShowSortSheet(false)}>
          <div className="sheet-panel" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <h3>Sort By</h3>
              <IonIcon icon={closeOutline} onClick={() => setShowSortSheet(false)} />
            </div>
            {sortOptions.map(opt => (
              <button
                key={opt.value}
                className={`sheet-option ${sort === opt.value ? 'selected' : ''}`}
                onClick={() => { setSort(opt.value); setShowSortSheet(false); }}
              >
                {opt.label}
                {sort === opt.value && <span className="check-dot" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bottom Sheet */}
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
              <input
                type="range" min={0} max={5000} step={100}
                value={priceRange[1]}
                onChange={e => setPriceRange([0, Number(e.target.value)])}
                className="price-slider"
              />
              <div className="price-presets">
                {[500, 1000, 2000, 5000].map(p => (
                  <button key={p} className={`preset-chip ${priceRange[1] === p ? 'active' : ''}`} onClick={() => setPriceRange([0, p])}>
                    Under ₹{p}
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
              <button className="sheet-btn-outline" onClick={() => { setPriceRange([0, 5000]); setInStockOnly(false); }}>
                Reset
              </button>
              <button className="sheet-btn-solid" onClick={() => setShowFilterSheet(false)}>
                Show {filtered.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </IonPage>
  );
};
export default ProductsPage;