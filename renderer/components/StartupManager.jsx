function StartupManager({ apps, onRefresh }) {
  const [disabledApps, setDisabledApps] = React.useState([]);
  const [loading, setLoading] = React.useState({});

  const toggleApp = async (app) => {
    const isCurrentlyEnabled = app.enabled && !disabledApps.includes(app.id);
    const willEnable = !isCurrentlyEnabled;
    
    setLoading(prev => ({ ...prev, [app.id]: true }));
    
    try {
      const result = await window.electronAPI.toggleStartupApp({
        name: app.name,
        location: app.location,
        command: app.command,
        enable: willEnable
      });
      
      if (result.success) {
        if (willEnable) {
          setDisabledApps(disabledApps.filter(id => id !== app.id));
        } else {
          setDisabledApps([...disabledApps, app.id]);
        }
        
        setTimeout(() => onRefresh(), 500);
      } else {
        alert(result.error || 'Nie udało się zmienić ustawień autostartu');
      }
    } catch (error) {
      console.error('Error toggling app:', error);
      alert('Błąd: Wymagane uprawnienia administratora');
    }
    
    setLoading(prev => ({ ...prev, [app.id]: false }));
  };

  if (!apps || apps.length === 0) {
    return (
      <section className="settings-section">
        <div className="section-header">
          <h2>Programy Autostartu <span className="beta-badge">BETA</span></h2>
          <button className="btn-icon" onClick={onRefresh} title="Odśwież">
            ↻
          </button>
        </div>
        <p className="no-data">Brak programów autostartu lub uruchom aplikację jako Administrator</p>
      </section>
    );
  }

  return (
    <section className="settings-section">
      <div className="section-header">
        <h2>Programy Autostartu ({apps.length}) <span className="beta-badge">BETA</span></h2>
        <button className="btn-icon" onClick={onRefresh} title="Odśwież">
          ↻
        </button>
      </div>
      <div className="startup-list">
        {apps.map((app) => {
          const isDisabled = disabledApps.includes(app.id);
          const isEnabled = app.enabled && !isDisabled;
          const isLoading = loading[app.id];
          
          return (
            <div key={app.id} className="startup-item">
              <div className="startup-info">
                <h4 className="startup-name">{app.name}</h4>
                <p className="startup-command" title={app.command}>
                  {app.command}
                </p>
                {app.location && (
                  <span className="startup-location">{app.location}</span>
                )}
              </div>
              <div className="startup-controls">
                <div className="startup-status">
                  <span className={`status-dot ${isEnabled ? 'enabled' : 'disabled'}`}></span>
                  <span className="status-text">{isEnabled ? 'Włączony' : 'Wyłączony'}</span>
                </div>
                <button 
                  className={`btn-toggle ${isEnabled ? 'btn-disable' : 'btn-enable'}`}
                  onClick={() => toggleApp(app)}
                  disabled={isLoading}
                  title={isEnabled ? 'Wyłącz' : 'Włącz'}
                >
                  {isLoading ? '⏳' : (isEnabled ? '✕' : '✓')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
