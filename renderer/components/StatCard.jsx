function StatCard({ title, icon, value, subtitle, color, progress }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-header">
        <span className="stat-icon">{icon}</span>
        <h3 className="stat-title">{title}</h3>
      </div>
      <div className="stat-card-body">
        <div className="stat-value">{value}</div>
        <div className="stat-subtitle">{subtitle}</div>
      </div>
      <div className="stat-progress">
        <div 
          className="stat-progress-fill"
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
      <div className="stat-card-glow"></div>
    </div>
  );
}
