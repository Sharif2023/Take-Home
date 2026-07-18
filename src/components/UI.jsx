export function Spinner({ size = 'md' }) {
  return (
    <div className={`spinner spinner-${size}`} role="status" aria-label="Loading">
      <div className="spinner-ring" />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="loading-page">
      <Spinner size="lg" />
      <p className="loading-text">Loading...</p>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="error-banner" role="alert">
      <div className="error-banner-content">
        <span className="error-icon">⚠️</span>
        <span>{message || 'Something went wrong'}</span>
      </div>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon || '📦'}</div>
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-desc">{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
