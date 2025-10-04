function Settings({ settings, onSaveSettings, addNotification }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [startupApps, setStartupApps] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(null);
  const [appVersion, setAppVersion] = useState('1.0.0');

  useEffect(() => {
    setLocalSettings(settings);
    loadStartupApps();
    checkForPendingUpdate();
    
    // Pobierz wersję aplikacji
    const fetchVersion = async () => {
      if (window.electronAPI && window.electronAPI.getAppVersion) {
        try {
          const version = await window.electronAPI.getAppVersion();
          setAppVersion(version);
        } catch (error) {
          console.error('Failed to get app version:', error);
        }
      }
    };
    fetchVersion();
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
    window.electronAPI.openExternal('https://optitool.pl');
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
              <h3>Tool v{appVersion}</h3>
              <p>Advanced System Optimization Tool</p>
              <p className="app-website" onClick={openWebsite}>🌐 optitool.pl</p>
            </div>
            <div className="app-credits">
              <p>© 2025 optitool.pl. Wszelkie prawa zastrzeżone.</p>
              <p>Made with ❤️ in Poland</p>
            </div>
            <div className="social-links">
              <a 
                href="#" 
                className="social-link discord"
                onClick={(e) => {
                  e.preventDefault();
                  window.electronAPI.openExternal('https://discord.gg/QYnVGXtf');
                }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Discord
              </a>
              <a 
                href="#" 
                className="social-link github"
                onClick={(e) => {
                  e.preventDefault();
                  window.electronAPI.openExternal('https://github.com/xvmee/tool');
                }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
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
