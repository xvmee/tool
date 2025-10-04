function Navigation({ currentView, onNavigate, systemStats }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'gameboost', label: 'Game Boost', icon: '⚡' },
    { id: 'cleaner', label: 'Czyszczenie', icon: '🧹' },
    { id: 'processes', label: 'Procesy', icon: '⚙️' },
    { id: 'settings', label: 'Ustawienia', icon: '⚙️' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-header">
        <div className="app-logo">
          <img src="assets/Tool.png" alt="Tool" className="logo-image-full" onError={(e) => {
            console.error('Failed to load logo');
            e.target.style.display = 'none';
          }} />
        </div>
      </div>

      <div className="nav-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {currentView === item.id && <div className="nav-indicator"></div>}
          </button>
        ))}
      </div>

      {systemStats && (
        <div className="nav-stats">
          <div className="mini-stat">
            <div className="mini-stat-header">
              <span className="mini-stat-icon">🖥️</span>
              <span className="mini-stat-label">CPU</span>
            </div>
            <div className="mini-stat-bar">
              <div
                className="mini-stat-fill cpu-fill"
                style={{ width: `${systemStats.cpu.usage}%` }}
              ></div>
            </div>
            <span className="mini-stat-value">{systemStats.cpu.usage}%</span>
          </div>

          <div className="mini-stat">
            <div className="mini-stat-header">
              <span className="mini-stat-icon">💾</span>
              <span className="mini-stat-label">RAM</span>
            </div>
            <div className="mini-stat-bar">
              <div
                className="mini-stat-fill ram-fill"
                style={{ width: `${systemStats.memory.usagePercent}%` }}
              ></div>
            </div>
            <span className="mini-stat-value">{systemStats.memory.usagePercent}%</span>
          </div>
        </div>
      )}

      <div className="nav-footer">
        <p className="version-text">v2.3.1</p>
        <p className="copyright">© 2025 tooltech.pl</p>
      </div>
    </nav>
  );
}
