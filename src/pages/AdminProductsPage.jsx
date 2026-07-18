import { useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../lib/api';
import { LoadingPage, ErrorBanner, EmptyState } from '../components/UI';
import { Plus, Pencil, Trash2, X, Loader, Package } from 'lucide-react';

const EMPTY_FORM = { name: '', price: '', quantity: '', imageUrl: '' };

function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState(
    isEdit
      ? { name: product.name, price: product.price, quantity: product.quantity, imageUrl: product.imageUrl || '' }
      : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid price required';
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) < 0) e.quantity = 'Valid quantity required';
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setApiError(null);
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        quantity: Number(form.quantity),
        imageUrl: form.imageUrl,
      };
      if (isEdit) {
        const { data } = await updateProduct(product._id, payload);
        onSaved(data, 'updated');
      } else {
        const { data } = await createProduct(payload);
        onSaved(data, 'created');
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Product' : 'New Product'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        {apiError && <div className="form-error-banner">{apiError}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="prod-name">Product Name</label>
            <input
              id="prod-name"
              type="text"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g. Wireless Headphones"
              value={form.name}
              onChange={handleChange('name')}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prod-price">Price ($)</label>
              <input
                id="prod-price"
                type="number"
                min="0"
                step="0.01"
                className={`form-input ${errors.price ? 'input-error' : ''}`}
                placeholder="0.00"
                value={form.price}
                onChange={handleChange('price')}
              />
              {errors.price && <span className="field-error">{errors.price}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="prod-qty">Quantity</label>
              <input
                id="prod-qty"
                type="number"
                min="0"
                className={`form-input ${errors.quantity ? 'input-error' : ''}`}
                placeholder="0"
                value={form.quantity}
                onChange={handleChange('quantity')}
              />
              {errors.quantity && <span className="field-error">{errors.quantity}</span>}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="prod-img">Image URL (optional)</label>
            <input
              id="prod-img"
              type="url"
              className="form-input"
              placeholder="https://example.com/image.jpg"
              value={form.imageUrl}
              onChange={handleChange('imageUrl')}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <Loader size={16} className="spin" /> : null}
              {isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ product, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await deleteProduct(product._id);
      onDeleted(product._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal confirm-modal">
        <div className="confirm-icon">🗑️</div>
        <h2 className="modal-title">Delete Product?</h2>
        <p className="modal-sub">
          Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be undone.
        </p>
        {error && <div className="form-error-banner">{error}</div>}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={deleting}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader size={16} className="spin" /> : <Trash2 size={16} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formTarget, setFormTarget] = useState(null); // null=closed, 'new', or product obj
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = useCallback(async (p) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getProducts(p, 20);
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(page);
  }, [page, fetchProducts]);

  const handleSaved = (savedProduct, action) => {
    if (action === 'created') {
      fetchProducts(page);
    } else {
      setProducts((ps) => ps.map((p) => (p._id === savedProduct._id ? savedProduct : p)));
    }
    setFormTarget(null);
    showToast(`Product ${action} successfully`);
  };

  const handleDeleted = (id) => {
    setProducts((ps) => ps.filter((p) => p._id !== id));
    setDeleteTarget(null);
    showToast('Product deleted');
  };

  return (
    <main className="page-content">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1 className="page-title">Product Management</h1>
            <p className="page-sub">Manage your product catalog</p>
          </div>
          <button className="btn btn-primary" onClick={() => setFormTarget('new')}>
            <Plus size={18} /> Add Product
          </button>
        </div>

        {error && <ErrorBanner message={error} onRetry={() => fetchProducts(page)} />}

        {loading ? (
          <LoadingPage />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Package size={48} />}
            title="No products yet"
            description="Create your first product to get started"
            action={
              <button className="btn btn-primary" onClick={() => setFormTarget('new')}>
                <Plus size={16} /> Add Product
              </button>
            }
          />
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <img
                          src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&q=60'}
                          alt={p.name}
                          className="table-thumb"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&q=60'; }}
                        />
                      </td>
                      <td>
                        <span className="table-product-name">{p.name}</span>
                        <span className="table-id">{p._id.slice(-6)}</span>
                      </td>
                      <td className="price-cell">${Number(p.price).toFixed(2)}</td>
                      <td>
                        <span className={`qty-pill ${p.quantity === 0 ? 'out' : p.quantity < 5 ? 'low' : 'ok'}`}>
                          {p.quantity}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setFormTarget(p)}
                            aria-label={`Edit ${p.name}`}
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteTarget(p)}
                            aria-label={`Delete ${p.name}`}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="table-pagination">
                <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </button>
                <span className="page-info">Page {page} / {totalPages}</span>
                <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {formTarget && (
        <ProductFormModal
          product={formTarget === 'new' ? null : formTarget}
          onClose={() => setFormTarget(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          {toast.msg}
        </div>
      )}
    </main>
  );
}
