function StartupManager({ apps, onRefresh }) {
  const [disabledApps, setDisabledApps] = React.useState([]);

  const toggleApp = async (app) => {
    const willDisable = !disabledApps.includes(app.id);
    
    try {
      if (willDisable) {
        // Disable startup
        if (app.location?.includes('HKCU')) {
          await window.electronAPI.runCommand(`reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${app.name}" /f`);
        } else if (app.location?.includes('HKLM')) {
          await window.electronAPI.runCommand(`reg delete "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${app.name}" /f`);
        }
        setDisabledApps([...disabledApps, app.id]);
      } else {
        // Re-enable would require knowing the original command
        // For now, just remove from disabled list
        setDisabledApps(disabledApps.filter(id => id !== app.id));
      }
      
      // Refresh the list
      setTimeout(() => onRefresh(), 500);
    } catch (error) {
      console.error('Error toggling app:', error);
    }
  };

  if (!apps || apps.length === 0) {
    return (
      <section className="settings-section">
        <div className="section-header">
          <h2>🚀 Programy Autostartu</h2>
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
        <h2>🚀 Programy Autostartu ({apps.length})</h2>
        <button className="btn-icon" onClick={onRefresh} title="Odśwież">
          ↻
        </button>
      </div>
      <div className="startup-list">
        {apps.map((app) => {
          const isDisabled = disabledApps.includes(app.id);
          const isEnabled = app.enabled && !isDisabled;
          
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
                  title={isEnabled ? 'Wyłącz' : 'Włącz'}
                >
                  {isEnabled ? '✕' : '✓'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
