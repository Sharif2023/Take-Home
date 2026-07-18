import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../lib/api';
import useCartStore from '../store/cartStore';
import { LoadingPage, ErrorBanner, EmptyState } from '../components/UI';
import { ShoppingCart, ChevronLeft, ChevronRight, X, Tag, Package, Star, Search, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import CustomerBadge from '../components/CustomerBadge';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';

// Generate a plausible product description from name since API doesn't return one
function generateDescription(name) {
  const templates = [
    `Experience premium quality with the ${name}. Crafted with attention to detail for everyday excellence.`,
    `The ${name} delivers outstanding performance and style. Perfect for those who demand the best.`,
    `Discover the ${name} — a blend of modern design and superior functionality built to last.`,
    `Elevate your lifestyle with the ${name}. Thoughtfully designed for comfort, durability, and style.`,
    `The ${name} is engineered for peak performance. High-quality materials meet sleek modern aesthetics.`,
  ];
  // Deterministic selection based on name length
  return templates[name.length % templates.length];
}

// ─── Product Quick-View Modal ────────────────────────────────────────────────
function ProductModal({ product, onClose }) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const inCart = items.find((i) => i.product._id === product._id);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="modal-overlay product-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.name}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal product-view-modal">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="pvm-layout">
          {/* Image side */}
          <div className="pvm-img-wrap">
            <img
              src={product.imageUrl || FALLBACK_IMAGE}
              alt={product.name}
              className="pvm-img"
              onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
            />
            {inCart && (
              <div className="pvm-in-cart">
                <ShoppingCart size={13} /> {inCart.quantity} in cart
              </div>
            )}
          </div>

          {/* Info side */}
          <div className="pvm-info">
            <div className="pvm-category">
              <Tag size={12} /> Product
            </div>
            <h2 className="pvm-name">{product.name}</h2>

            <div className="pvm-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < 4 ? '#f59e0b' : 'none'} stroke={i < 4 ? '#f59e0b' : '#4b5563'} />
              ))}
              <span className="pvm-rating-text">4.0 (128 reviews)</span>
            </div>

            <p className="pvm-description">{generateDescription(product.name)}</p>

            <div className="pvm-price-row">
              <span className="pvm-price">${Number(product.price).toFixed(2)}</span>
              <span className={`stock-badge ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {product.quantity > 0 ? (
                  <><Package size={11} /> {product.quantity} in stock</>
                ) : 'Out of stock'}
              </span>
            </div>

            <div className="pvm-features">
              <div className="pvm-feature-item"><span>🚚</span> Free delivery in BD</div>
              <div className="pvm-feature-item"><span>🔄</span> 7-day easy return</div>
              <div className="pvm-feature-item"><span>✅</span> Authenticity guaranteed</div>
            </div>

            <button
              className={`btn w-full pvm-add-btn ${added ? 'btn-success' : 'btn-primary'}`}
              onClick={handleAdd}
              disabled={product.quantity === 0}
            >
              <ShoppingCart size={17} />
              {added ? '✓ Added to Cart!' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ────────────────────────────────────────────────────────────
function ProductCard({ product, onOpenModal }) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const inCart = items.find((i) => i.product._id === product._id);
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article
      className="product-card"
      onClick={() => onOpenModal(product)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${product.name}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenModal(product); }}
    >
      <div className="product-img-wrap">
        <img
          src={product.imageUrl || FALLBACK_IMAGE}
          alt={product.name}
          className="product-img"
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
          loading="lazy"
        />
        {inCart && (
          <div className="in-cart-badge">
            <ShoppingCart size={12} />
            {inCart.quantity} in cart
          </div>
        )}
        <div className="product-overlay">
          <span className="product-quickview">Quick View</span>
        </div>
      </div>
      <div className="product-body">
        <div className="product-category-tag"><Tag size={10} /> Product</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{generateDescription(product.name)}</p>
        <div className="product-meta">
          <span className="product-price">${Number(product.price).toFixed(2)}</span>
          <span className={`stock-badge ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.quantity > 0 ? `${product.quantity} left` : 'Out of stock'}
          </span>
        </div>
        <button
          className={`btn btn-primary w-full mt-auto ${added ? 'btn-success' : ''}`}
          onClick={handleAdd}
          disabled={product.quantity === 0}
        >
          <ShoppingCart size={15} />
          {added ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}

// ─── Skeleton Card ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="product-card skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="product-body">
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line medium" />
        <div className="skeleton skeleton-line btn-line" />
      </div>
    </div>
  );
}

// ─── Pagination ──────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPageChange }) {
  const pages = [];
  const range = 2;
  for (let i = Math.max(1, page - range); i <= Math.min(totalPages, page + range); i++) {
    pages.push(i);
  }

  return (
    <nav className="pagination" aria-label="Products pagination">
      <button
        className="page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages[0] > 1 && (
        <>
          <button className="page-btn" onClick={() => onPageChange(1)}>1</button>
          {pages[0] > 2 && <span className="page-ellipsis">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`page-btn ${p === page ? 'active' : ''}`}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="page-ellipsis">…</span>}
          <button className="page-btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button
        className="page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

// ─── Custom Sort Dropdown ────────────────────────────────────────────────────
function CustomSortDropdown({ sort, setSort }) {
  const [isOpen, setIsOpen] = useState(false);
  const options = [
    { value: 'default', label: 'Default' },
    { value: 'price-asc', label: 'Price: Low → High' },
    { value: 'price-desc', label: 'Price: High → Low' },
    { value: 'name', label: 'Name: A → Z' },
  ];
  
  const currentLabel = options.find((o) => o.value === sort)?.label || 'Default';

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const close = (e) => {
      if (!e.target.closest('.custom-sort-container')) setIsOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [isOpen]);

  return (
    <div className="custom-sort-container">
      <button
        className={`custom-sort-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <SlidersHorizontal size={15} className="sort-icon" />
        <span className="sort-label">Sort: <span className="sort-value">{currentLabel}</span></span>
        <ChevronDown size={14} className={`sort-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="custom-sort-menu" role="listbox">
          <div className="sort-menu-header">Sort By</div>
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`custom-sort-option ${sort === opt.value ? 'selected' : ''}`}
              role="option"
              aria-selected={sort === opt.value}
              onClick={() => {
                setSort(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
              {sort === opt.value && <Check size={14} className="sort-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');

  const fetchProducts = useCallback(async (p) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getProducts(p, 20);
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.totalProducts || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, fetchProducts]);

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  // Client-side filter + sort (within current page)
  const displayedProducts = [...products]
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <main className="page-content">
      {/* Hero banner */}
      <section className="products-hero">
        <div className="products-hero-content">
          <CustomerBadge />
          <h1 className="products-hero-title">
            Discover Our <span className="gradient-text">Collection</span>
          </h1>
          <p className="products-hero-sub">
            {totalProducts > 0 ? `${totalProducts} curated products, just for you` : 'Explore our curated catalog'}
          </p>
          {/* Search + Sort bar */}
          <div className="hero-controls">
            <div className="search-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="search"
                className="search-input"
                placeholder="Search products on this page…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search products"
              />
            </div>
            <CustomSortDropdown sort={sort} setSort={setSort} />
          </div>
        </div>
      </section>

      <div className="products-section">
        {error && (
          <ErrorBanner message={error} onRetry={() => fetchProducts(page)} />
        )}

        {loading ? (
          <div className="product-grid">
            {[...Array(20)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : displayedProducts.length === 0 ? (
          <EmptyState
            icon="🛍️"
            title={search ? `No results for "${search}"` : 'No products found'}
            description={search ? 'Try a different search term.' : 'Check back later for new arrivals.'}
          />
        ) : (
          <>
            <div className="products-info">
              <p className="products-count">
                Page {page} of {totalPages} &middot; {totalProducts} total products
                {search && ` · ${displayedProducts.length} match${displayedProducts.length !== 1 ? 'es' : ''}`}
              </p>
            </div>
            <div className="product-grid">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onOpenModal={setSelectedProduct}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
          </>
        )}
      </div>

      {/* Product Quick-View Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  );
}
