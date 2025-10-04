function UpdateNotification() {
  const [updateState, setUpdateState] = React.useState({
    checking: false,
    available: false,
    downloading: false,
    downloaded: false,
    error: null,
    version: null,
    releaseNotes: null,
    progress: 0,
    bytesPerSecond: 0,
    transferred: 0,
    total: 0
  });

  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    window.api.on('update-status', (data) => {
      if (data.status === 'checking') {
        setUpdateState(prev => ({ ...prev, checking: true }));
      } else if (data.status === 'not-available') {
        setUpdateState(prev => ({ ...prev, checking: false, available: false }));
      }
    });

    window.api.on('update-available', (data) => {
      setUpdateState(prev => ({
        ...prev,
        checking: false,
        available: true,
        version: data.version,
        releaseNotes: data.releaseNotes
      }));
      setVisible(true);
    });

    window.api.on('update-download-progress', (data) => {
      setUpdateState(prev => ({
        ...prev,
        downloading: true,
        progress: Math.round(data.percent),
        bytesPerSecond: data.bytesPerSecond,
        transferred: data.transferred,
        total: data.total
      }));
    });

    window.api.on('update-downloaded', (data) => {
      setUpdateState(prev => ({
        ...prev,
        downloading: false,
        downloaded: true,
        version: data.version
      }));
    });

    window.api.on('update-error', (data) => {
      setUpdateState(prev => ({
        ...prev,
        checking: false,
        downloading: false,
        error: data.error
      }));
      setVisible(true);
    });

    return () => {
      window.api.removeAllListeners('update-status');
      window.api.removeAllListeners('update-available');
      window.api.removeAllListeners('update-download-progress');
      window.api.removeAllListeners('update-downloaded');
      window.api.removeAllListeners('update-error');
    };
  }, []);

  const handleDownload = () => {
    window.api.send('download-update');
  };

  const handleInstall = () => {
    window.api.send('install-update');
    // Clear pending update from localStorage
    localStorage.removeItem('pendingUpdate');
  };

  const handleClose = () => {
    setVisible(false);
    // Save update info to localStorage so Settings can show it
    if (updateState.available && !updateState.downloaded) {
      localStorage.setItem('pendingUpdate', JSON.stringify({
        version: updateState.version,
        releaseNotes: updateState.releaseNotes,
        timestamp: Date.now()
      }));
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond) => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  if (!visible) return null;

  return (
    <div className="update-notification-overlay">
      <div className="update-notification">
        <div className="update-header">
          <div className="update-icon">
            {updateState.error ? '⚠️' : updateState.downloaded ? '✅' : '🔔'}
          </div>
          <h3>
            {updateState.error ? 'Błąd Aktualizacji' : 
             updateState.downloaded ? 'Aktualizacja Gotowa!' :
             updateState.downloading ? 'Pobieranie Aktualizacji...' :
             updateState.available ? 'Dostępna Nowa Wersja!' : 
             'Sprawdzanie Aktualizacji...'}
          </h3>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        <div className="update-body">
          {updateState.error && (
            <div className="update-error">
              <p>Nie udało się sprawdzić aktualizacji:</p>
              <code>{updateState.error}</code>
              <p className="error-hint">Sprawdź połączenie z internetem lub spróbuj później.</p>
            </div>
          )}

          {updateState.available && !updateState.downloading && !updateState.downloaded && (
            <div className="update-available">
              <p className="version-info">
                Nowa wersja <strong>v{updateState.version}</strong> jest dostępna!
              </p>
              
              {updateState.releaseNotes && (
                <div className="release-notes">
                  <h4>Co nowego:</h4>
                  <div 
                    className="release-notes-content"
                    dangerouslySetInnerHTML={{ __html: updateState.releaseNotes }}
                  />
                </div>
              )}

              <div className="update-actions">
                <button className="btn-download" onClick={handleDownload}>
                  📥 Pobierz Aktualizację
                </button>
                <button className="btn-later" onClick={handleClose}>
                  Później
                </button>
              </div>
            </div>
          )}

          {/* Pobieranie */}
          {updateState.downloading && (
            <div className="update-downloading">
              <div className="progress-info">
                <span>Pobieranie v{updateState.version}...</span>
                <span className="progress-percent">{updateState.progress}%</span>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${updateState.progress}%` }}
                />
              </div>

              <div className="download-stats">
                <span>{formatBytes(updateState.transferred)} / {formatBytes(updateState.total)}</span>
                <span className="download-speed">{formatSpeed(updateState.bytesPerSecond)}</span>
              </div>

              <p className="download-hint">
                ⏳ Proszę czekać... Aktualizacja zostanie zainstalowana po zamknięciu aplikacji.
              </p>
            </div>
          )}

          {/* Pobrano */}
          {updateState.downloaded && (
            <div className="update-downloaded">
              <p className="success-message">
                ✅ Aktualizacja v{updateState.version} została pobrana!
              </p>
              <p className="install-hint">
                Kliknij "Zainstaluj Teraz" aby zamknąć aplikację i zainstalować aktualizację.
              </p>

              <div className="update-actions">
                <button className="btn-install" onClick={handleInstall}>
                  🚀 Zainstaluj Teraz
                </button>
                <button className="btn-later" onClick={handleClose}>
                  Zainstaluj Później (przy zamknięciu)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
