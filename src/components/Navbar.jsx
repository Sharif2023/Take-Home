import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { ShoppingCart, LogOut, LayoutDashboard, Package, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/products');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/products" className="navbar-brand">
          <div className="navbar-logo">
            <Package size={20} />
          </div>
          <span>ShopSnap</span>
        </Link>

        {/* Nav links */}
        <nav className="navbar-links">
          <Link
            to="/products"
            className={`nav-link ${pathname === '/products' ? 'active' : ''}`}
          >
            Products
          </Link>
          {isAdmin() && (
            <>
              <Link
                to="/admin/products"
                className={`nav-link ${pathname.startsWith('/admin/products') ? 'active' : ''}`}
              >
                Manage Products
              </Link>
              <Link
                to="/admin/orders"
                className={`nav-link ${pathname.startsWith('/admin/orders') ? 'active' : ''}`}
              >
                Orders
              </Link>
            </>
          )}
        </nav>

        {/* Right actions */}
        <div className="navbar-actions">
          {isAuthenticated() && user && (
            <div className="nav-user">
              <User size={14} />
              <span>{user.name}</span>
              {isAdmin() && <span className="admin-badge">Admin</span>}
            </div>
          )}

          {/* Cart */}
          <Link to="/cart" className="cart-btn" aria-label="Shopping cart">
            <ShoppingCart size={20} />
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </Link>

          {isAuthenticated() ? (
            <button onClick={handleLogout} className="btn btn-ghost btn-sm">
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              <LayoutDashboard size={16} />
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
