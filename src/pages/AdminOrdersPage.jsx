import { useState, useEffect } from 'react';
import { getOrders, getOrder } from '../lib/api';
import { LoadingPage, ErrorBanner, EmptyState } from '../components/UI';
import { X, Eye, Package } from 'lucide-react';

function OrderDetailModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getOrder(orderId);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal order-detail-modal">
        <div className="modal-header">
          <h2 className="modal-title">Order Details</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        {loading && <div className="modal-loading">Loading…</div>}
        {error && <div className="form-error-banner">{error}</div>}

        {order && (
          <div className="order-detail">
            <div className="order-detail-section">
              <h3 className="detail-section-title">Customer Info</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{order.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{order.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{order.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{order.address}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Customer Type</span>
                  <span className={`customer-type-badge ${order.recurring_customer ? 'returning' : 'new'}`}>
                    {order.recurring_customer ? '🔁 Returning' : '🆕 New'}
                  </span>
                </div>
              </div>
            </div>

            <div className="order-detail-section">
              <h3 className="detail-section-title">Products</h3>
              <div className="order-products-list">
                {order.products.map((item, idx) => (
                  <div key={idx} className="order-product-row">
                    <div className="order-product-id">
                      <Package size={14} />
                      <code>{typeof item.product === 'object' ? item.product._id : item.product}</code>
                    </div>
                    <div className="order-product-right">
                      <span className="qty-pill ok">× {item.quantity}</span>
                      {typeof item.product === 'object' && item.product.price && (
                        <span style={{marginLeft: '0.5rem', color: 'var(--text-muted)'}}>
                          (৳{item.product.price} each)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-detail-section">
              <div className="order-total-row">
                <span>Order Total</span>
                <span className="order-total-value">
                  ৳{Number(
                    order.totalPrice || 
                    (order.products || []).reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0)
                  ).toFixed(2)}
                </span>
              </div>
              <p className="order-date">
                Placed: {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function statusChip(order) {
  // Orders don't have a status field from API, so we just show "Completed"
  return <span className="status-chip completed">Completed</span>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getOrders();
      setOrders(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <main className="page-content">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1 className="page-title">Order Management</h1>
            <p className="page-sub">{orders.length} total orders</p>
          </div>
        </div>

        {error && <ErrorBanner message={error} onRetry={fetchOrders} />}

        {loading ? (
          <LoadingPage />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No orders yet"
            description="Orders placed by customers will appear here."
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Customer Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <code className="order-id">{order._id.slice(-8)}</code>
                    </td>
                    <td>{order.name}</td>
                    <td className="email-cell">{order.email}</td>
                    <td>
                      <span className="qty-pill ok">{order.products?.length || 0}</span>
                    </td>
                    <td className="price-cell">
                      ৳{Number(
                        order.totalPrice || 
                        (order.products || []).reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0)
                      ).toFixed(2)}
                    </td>
                    <td>
                      <span className={`customer-type-badge ${order.recurring_customer ? 'returning' : 'new'}`}>
                        {order.recurring_customer ? '🔁 Returning' : '🆕 New'}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td>{statusChip(order)}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setSelectedOrderId(order._id)}
                        aria-label={`View order ${order._id}`}
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </main>
  );
}
