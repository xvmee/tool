function Settings({ settings, onSaveSettings, addNotification }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [startupApps, setStartupApps] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(null);

  useEffect(() => {
    setLocalSettings(settings);
    loadStartupApps();
    checkForPendingUpdate();
  }, [settings]);

  const checkForPendingUpdate = () => {
    const pendingUpdate = localStorage.getItem('pendingUpdate');
    if (pendingUpdate) {
      try {
        const updateData = JSON.parse(pendingUpdate);
        // Check if update info is not older than 7 days
        const age = Date.now() - updateData.timestamp;
        if (age < 7 * 24 * 60 * 60 * 1000) {
          setUpdateAvailable({
            version: updateData.version,
            releaseNotes: updateData.releaseNotes
          });
        } else {
          localStorage.removeItem('pendingUpdate');
        }
      } catch (error) {
        console.error('Error parsing pending update:', error);
        localStorage.removeItem('pendingUpdate');
      }
    }
  };

  const checkForUpdates = () => {
    window.api.on('update-available', (data) => {
      setUpdateAvailable({
        version: data.version,
        releaseNotes: data.releaseNotes
      });
    });

    window.api.on('update-not-available', () => {
      setUpdateAvailable(null);
    });

    return () => {
      window.api.removeAllListeners('update-available');
      window.api.removeAllListeners('update-not-available');
    };
  };

  const loadStartupApps = async () => {
    try {
      const apps = await window.electronAPI.getStartupApps();
      setStartupApps(apps);
    } catch (error) {
      console.error('Error loading startup apps:', error);
    }
  };

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onSaveSettings(localSettings);
    setHasChanges(false);
    addNotification('Ustawienia zapisane pomyślnie!', 'success');
    
    if (localSettings.autostart !== settings.autostart) {
      await window.electronAPI.setAutostart(localSettings.autostart);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
    addNotification('Ustawienia przywrócone', 'info');
  };

  const openWebsite = () => {
    window.electronAPI.openExternal('https://tooltech.pl');
  };

  const handleDownloadUpdate = () => {
    window.api.send('download-update');
    addNotification('Pobieranie aktualizacji...', 'info');
    // Clear from localStorage as user is downloading
    localStorage.removeItem('pendingUpdate');
  };

  const handleDismissUpdate = () => {
    setUpdateAvailable(null);
    // Keep in localStorage for later reminder
  };

  return (
    <div className="settings">
      <header className="settings-header">
        <h1 className="gradient-text">Ustawienia</h1>
        <p className="subtitle">Dostosuj Tool do swoich potrzeb</p>
      </header>

      {updateAvailable && (
        <div className="update-banner">
          <div className="update-banner-content">
            <div className="update-banner-icon">🎉</div>
            <div className="update-banner-text">
              <h3>Nowa wersja dostępna!</h3>
              <p>Wersja {updateAvailable.version} jest gotowa do pobrania</p>
              {updateAvailable.releaseNotes && (
                <p className="release-notes">{updateAvailable.releaseNotes}</p>
              )}
            </div>
          </div>
          <div className="update-banner-actions">
            <button className="btn-update-download" onClick={handleDownloadUpdate}>
              Pobierz teraz
            </button>
            <button className="btn-update-later" onClick={handleDismissUpdate}>
              Później
            </button>
          </div>
        </div>
      )}

      <div className="settings-content">
        <section className="settings-section">
          <h2>🎨 Wygląd</h2>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <label>Motyw</label>
                <p className="setting-description">Wybierz jasny lub ciemny motyw interfejsu</p>
              </div>
              <div className="setting-control">
                <select 
                  value={localSettings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="setting-select"
                >
                  <option value="dark">Ciemny</option>
                  <option value="light">Jasny</option>
                </select>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Język</label>
                <p className="setting-description">Wybierz język aplikacji</p>
              </div>
              <div className="setting-control">
                <select 
                  value={localSettings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="setting-select"
                >
                  <option value="pl">Polski</option>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>⚙️ Funkcje</h2>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <label>Autostart</label>
                <p className="setting-description">Uruchamiaj Tool automatycznie przy starcie systemu</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input 
                    type="checkbox"
                    checked={localSettings.autostart}
                    onChange={(e) => handleChange('autostart', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Powiadomienia</label>
                <p className="setting-description">Wyświetlaj powiadomienia systemowe</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input 
                    type="checkbox"
                    checked={localSettings.notifications}
                    onChange={(e) => handleChange('notifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Częstotliwość odświeżania</label>
                <p className="setting-description">Jak często aktualizować statystyki (ms)</p>
              </div>
              <div className="setting-control">
                <input 
                  type="number"
                  value={localSettings.refreshInterval}
                  onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                  min="1000"
                  max="10000"
                  step="500"
                  className="setting-input"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>⌨️ Skróty Klawiszowe</h2>
          <div className="shortcuts-list">
            <div className="shortcut-item">
              <span className="shortcut-label">Otwórz/Zamknij Tool</span>
              <kbd className="shortcut-key">Ctrl+Shift+T</kbd>
            </div>
            <div className="shortcut-item">
              <span className="shortcut-label">Dashboard</span>
              <kbd className="shortcut-key">Ctrl+1</kbd>
            </div>
            <div className="shortcut-item">
              <span className="shortcut-label">Monitor</span>
              <kbd className="shortcut-key">Ctrl+2</kbd>
            </div>
            <div className="shortcut-item">
              <span className="shortcut-label">Procesy</span>
              <kbd className="shortcut-key">Ctrl+3</kbd>
            </div>
            <div className="shortcut-item">
              <span className="shortcut-label">Ustawienia</span>
              <kbd className="shortcut-key">Ctrl+,</kbd>
            </div>
            <div className="shortcut-item">
              <span className="shortcut-label">Optymalizuj RAM</span>
              <kbd className="shortcut-key">Ctrl+Shift+O</kbd>
            </div>
            <div className="shortcut-item">
              <span className="shortcut-label">Wyczyść Cache</span>
              <kbd className="shortcut-key">Ctrl+Shift+C</kbd>
            </div>
          </div>
        </section>

        <StartupManager apps={startupApps} onRefresh={loadStartupApps} />

        <section className="settings-section">
          <h2>ℹ️ Informacje</h2>
          <div className="info-box">
            <div className="app-info">
              <h3>Tool v1.0.0</h3>
              <p>Advanced System Optimization Tool</p>
              <p className="app-website" onClick={openWebsite}>🌐 tooltech.pl</p>
            </div>
            <div className="app-credits">
              <p>© 2025 tooltech.pl. Wszelkie prawa zastrzeżone.</p>
              <p>Made with ❤️ in Poland</p>
            </div>
          </div>
        </section>

        <div className="settings-actions">
          <button 
            className="btn-secondary"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            ↺ Przywróć
          </button>
          <button 
            className="btn-primary"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            ✓ Zapisz Zmiany
          </button>
        </div>
      </div>
    </div>
  );
}
