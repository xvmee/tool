function ActionButton({ title, description, icon, color, onClick, isLoading, gradient }) {
  return (
    <button 
      className={`action-button action-button-${color} ${isLoading ? 'loading' : ''}`}
      onClick={onClick}
      disabled={isLoading}
      style={{ background: gradient }}
    >
      <div className="action-button-content">
        <div className="action-icon">{icon}</div>
        <div className="action-text">
          <h3 className="action-title">{title}</h3>
          <p className="action-description">{description}</p>
        </div>
      </div>
      {isLoading && (
        <div className="action-loading">
          <div className="loading-spinner-small"></div>
        </div>
      )}
      <div className="action-button-shine"></div>
    </button>
  );
}
