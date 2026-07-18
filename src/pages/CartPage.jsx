import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import { placeOrder } from '../lib/api';
import { markAsReturningCustomer } from '../components/CustomerBadge';
import { EmptyState } from '../components/UI';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Loader, RefreshCw } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
const BDT = (amount) => `৳${Number(amount).toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;

const BD_DIVISIONS = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna',
  'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh',
];

// Phone: exact 10 digits after +880 (e.g. 17XXXXXXXX)
const BD_PHONE_REGEX = /^1[3-9]\d{8}$/;

function CheckoutModal({ onClose, onSuccess, retryCount }) {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal)();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    division: '',
    district: '',
    thana: '',
    street: '',
    postalCode: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!BD_PHONE_REGEX.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Enter a valid BD number (e.g. 1XXXXXXXXX)';
    if (!form.division) e.division = 'Please select a division';
    if (!form.district.trim()) e.district = 'District is required';
    if (!form.thana.trim()) e.thana = 'Thana / Upazila is required';
    if (!form.street.trim()) e.street = 'Street / house address is required';
    return e;
  };

  const buildAddress = () =>
    [form.street, form.thana, form.district, form.division, form.postalCode]
      .filter(Boolean)
      .join(', ');

  const submitOrder = async () => {
    setSubmitting(true);
    setApiError(null);
    try {
      const isReturning = localStorage.getItem('snap_has_ordered') === '1';
      await placeOrder({
        products: items.map((i) => ({ product: i.product._id, quantity: i.quantity })),
        name: form.name,
        email: form.email,
        phone: '+880' + form.phone,
        address: buildAddress(),
        recurring_customer: isReturning,
      });
      markAsReturningCustomer();
      onSuccess();
    } catch (err) {
      // API intentionally fails ~50% of the time
      setApiError(err.response?.data?.message || 'Order failed. The server had an issue. Please try again.');
    } finally {
      setSubmitting(false);
      setRetrying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    await submitOrder();
  };

  const handleRetry = async () => {
    setRetrying(true);
    await submitOrder();
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Checkout">
      <div className="modal checkout-modal">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Delivery Information</h2>
            <p className="modal-sub">Bangladesh delivery — fill in your details</p>
          </div>
        </div>

        {apiError && (
          <div className="form-error-banner">
            <span>{apiError}</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm retry-btn"
              onClick={handleRetry}
              disabled={retrying}
            >
              {retrying ? <Loader size={14} className="spin" /> : <RefreshCw size={14} />}
              Retry
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="checkout-form">
          {/* ── Personal Info ── */}
          <p className="form-section-label">Personal Information</p>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="co-name">Full Name *</label>
              <input
                id="co-name"
                type="text"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. John Doe"
                value={form.name}
                onChange={handleChange('name')}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="co-phone">Mobile Number *</label>
              <div className="bd-phone-wrap">
                <span className="bd-flag">+880</span>
                <input
                  id="co-phone"
                  type="tel"
                  className={`form-input bd-phone-input ${errors.phone ? 'input-error' : ''}`}
                  placeholder="1XXXXXXXXX"
                  maxLength={10}
                  value={form.phone}
                  onChange={handleChange('phone')}
                />
              </div>
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="co-email">Email Address *</label>
            <input
              id="co-email"
              type="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange('email')}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* ── Delivery Address ── */}
          <p className="form-section-label">Delivery Address</p>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="co-division">Division *</label>
              <select
                id="co-division"
                className={`form-input form-select ${errors.division ? 'input-error' : ''}`}
                value={form.division}
                onChange={handleChange('division')}
              >
                <option value="">— Select Division —</option>
                {BD_DIVISIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.division && <span className="field-error">{errors.division}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="co-district">District *</label>
              <input
                id="co-district"
                type="text"
                className={`form-input ${errors.district ? 'input-error' : ''}`}
                placeholder="e.g. Gazipur"
                value={form.district}
                onChange={handleChange('district')}
              />
              {errors.district && <span className="field-error">{errors.district}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="co-thana">Thana / Upazila *</label>
              <input
                id="co-thana"
                type="text"
                className={`form-input ${errors.thana ? 'input-error' : ''}`}
                placeholder="e.g. Tongi"
                value={form.thana}
                onChange={handleChange('thana')}
              />
              {errors.thana && <span className="field-error">{errors.thana}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="co-postal">Postal Code</label>
              <input
                id="co-postal"
                type="text"
                className="form-input"
                placeholder="e.g. 1710"
                maxLength={6}
                value={form.postalCode}
                onChange={handleChange('postalCode')}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="co-street">House / Road / Area *</label>
            <textarea
              id="co-street"
              className={`form-input form-textarea ${errors.street ? 'input-error' : ''}`}
              placeholder="e.g. House No., Road No., Area"
              value={form.street}
              onChange={handleChange('street')}
              rows={2}
            />
            {errors.street && <span className="field-error">{errors.street}</span>}
          </div>

          {/* ── Order Total ── */}
          <div className="checkout-total-bar">
            <span>Order Total</span>
            <span className="checkout-total-val">{BDT(subtotal)}</span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <><Loader size={16} className="spin" /> Placing Order…</> : '✓ Confirm Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SuccessModal({ onClose }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal success-modal">
        <div className="success-icon">🎉</div>
        <h2 className="modal-title">Order Confirmed!</h2>
        <p className="modal-sub">
          আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে।<br />
          Your order has been placed successfully. We'll deliver it to you soon!
        </p>
        <button className="btn btn-primary w-full" onClick={onClose}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getTotalItems } = useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();

  const handleSuccess = () => {
    clearCart();
    setShowCheckout(false);
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/products');
  };

  if (items.length === 0 && !showSuccess) {
    return (
      <main className="page-content">
        <div className="container">
          <EmptyState
            icon="🛒"
            title="Your cart is empty"
            description="Browse our collection and add some products!"
            action={
              <Link to="/products" className="btn btn-primary">
                <ArrowLeft size={16} /> Browse Products
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  return (
    <main className="page-content">
      <div className="container">
        <div className="cart-header">
          <h1 className="page-title">Shopping Cart</h1>
          <p className="cart-summary-text">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
        </div>

        <div className="cart-layout">
          {/* Items list */}
          <section className="cart-items" aria-label="Cart items">
            {items.map(({ product, quantity }) => (
              <div key={product._id} className="cart-item">
                <img
                  src={product.imageUrl || FALLBACK_IMAGE}
                  alt={product.name}
                  className="cart-item-img"
                  onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                />
                <div className="cart-item-info">
                  <h3 className="cart-item-name">{product.name}</h3>
                  <p className="cart-item-price">{BDT(product.price)} each</p>
                </div>
                <div className="cart-item-controls">
                  <div className="qty-control">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(product._id, quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-value">{quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(product._id, quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="cart-item-total">
                    {BDT(product.price * quantity)}
                  </span>
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(product._id)}
                    aria-label={`Remove ${product.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Order summary */}
          <aside className="cart-summary">
            <div className="summary-card">
              <h2 className="summary-title">Order Summary</h2>
              <div className="summary-row">
                <span>Items ({totalItems})</span>
                <span>{BDT(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-text">Free</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row total-row">
                <span>Total</span>
                <span>{BDT(subtotal)}</span>
              </div>
              <button
                className="btn btn-primary w-full"
                onClick={() => setShowCheckout(true)}
              >
                <ShoppingBag size={18} />
                Proceed to Checkout
              </button>
              <Link to="/products" className="btn btn-ghost w-full mt-2">
                <ArrowLeft size={16} /> Continue Shopping
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onSuccess={handleSuccess}
        />
      )}
      {showSuccess && <SuccessModal onClose={handleSuccessClose} />}
    </main>
  );
}
