function AdvancedCleaner({ addNotification }) {
  const [isScanning, setIsScanning] = React.useState(false);
  const [isCleaning, setIsCleaning] = React.useState(false);
  const [scanResults, setScanResults] = React.useState(null);
  const [selectedItems, setSelectedItems] = React.useState({
    tempFiles: true,
    browserCache: true,
    recyclingBin: true,
    windowsLogs: true,
    thumbnails: true,
    prefetch: true,
    crashDumps: true,
    downloadedInstalls: true,
    oldWindowsUpdates: true,
    windowsErrorReports: true,
    deliveryOptimization: true,
    directXCache: true
  });

  const scanForCleanup = async () => {
    setIsScanning(true);
    addNotification('Skanowanie systemu...', 'info');

    try {
      const results = await window.electronAPI.scanForCleanup();
      setScanResults(results);
      
      const totalSizeMB = Object.values(results).reduce((sum, item) => sum + item.sizeMB, 0);
      addNotification(`Znaleziono ${totalSizeMB.toFixed(2)} MB do wyczyszczenia`, 'success');
    } catch (error) {
      addNotification('Błąd podczas skanowania', 'error');
    }

    setIsScanning(false);
  };

  const performCleanup = async () => {
    if (!scanResults) {
      addNotification('Najpierw uruchom skanowanie', 'warning');
      return;
    }

    setIsCleaning(true);
    addNotification('Czyszczenie w toku...', 'info');

    try {
      const itemsToClean = Object.keys(selectedItems).filter(key => selectedItems[key]);
      const result = await window.electronAPI.performAdvancedCleanup(itemsToClean);
      
      if (result.success) {
        addNotification(`✓ Wyczyszczono ${result.freedSpaceMB.toFixed(2)} MB`, 'success');
        result.cleaned.forEach((item, i) => {
          setTimeout(() => addNotification(item, 'success'), (i + 1) * 200);
        });
        // Reset scan results
        setScanResults(null);
      } else {
        addNotification('Błąd podczas czyszczenia', 'error');
      }
    } catch (error) {
      addNotification('Błąd podczas czyszczenia', 'error');
    }

    setIsCleaning(false);
  };

  const toggleItem = (item) => {
    setSelectedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const toggleAll = (value) => {
    const newState = {};
    Object.keys(selectedItems).forEach(key => {
      newState[key] = value;
    });
    setSelectedItems(newState);
  };

  const cleanupCategories = [
    {
      id: 'tempFiles',
      name: 'Pliki Tymczasowe',
      icon: '📁',
      description: 'Pliki tymczasowe Windows i użytkownika',
      risk: 'safe'
    },
    {
      id: 'browserCache',
      name: 'Cache Przeglądarek',
      icon: '🌐',
      description: 'Chrome, Edge, Firefox cache i cookies',
      risk: 'safe'
    },
    {
      id: 'recyclingBin',
      name: 'Kosz',
      icon: '🗑️',
      description: 'Zawartość kosza systemowego',
      risk: 'safe'
    },
    {
      id: 'windowsLogs',
      name: 'Logi Windows',
      icon: '📋',
      description: 'Pliki logów systemowych',
      risk: 'safe'
    },
    {
      id: 'thumbnails',
      name: 'Miniatury',
      icon: '🖼️',
      description: 'Cache miniatur obrazów',
      risk: 'safe'
    },
    {
      id: 'prefetch',
      name: 'Prefetch',
      icon: '⚡',
      description: 'Pliki przyspieszające uruchamianie',
      risk: 'moderate'
    },
    {
      id: 'crashDumps',
      name: 'Crash Dumps',
      icon: '💥',
      description: 'Raporty awarii systemu',
      risk: 'safe'
    },
    {
      id: 'downloadedInstalls',
      name: 'Pobrane Instalatory',
      icon: '📦',
      description: 'Pliki instalacyjne w Downloads',
      risk: 'moderate'
    },
    {
      id: 'oldWindowsUpdates',
      name: 'Stare Aktualizacje',
      icon: '🔄',
      description: 'Backup starych aktualizacji Windows',
      risk: 'safe'
    },
    {
      id: 'windowsErrorReports',
      name: 'Raporty Błędów',
      icon: '⚠️',
      description: 'Windows Error Reporting',
      risk: 'safe'
    },
    {
      id: 'deliveryOptimization',
      name: 'Delivery Optimization',
      icon: '📡',
      description: 'Cache Windows Update P2P',
      risk: 'safe'
    },
    {
      id: 'directXCache',
      name: 'DirectX Shader Cache',
      icon: '🎮',
      description: 'Cache shaderów DirectX',
      risk: 'moderate'
    }
  ];

  return (
    <div className="advanced-cleaner">
      <div className="cleaner-header">
        <h2>🧹 Zaawansowane Czyszczenie</h2>
        <p>Profesjonalne czyszczenie systemu z pełną kontrolą</p>
      </div>

      <div className="cleaner-actions">
        <button 
          className={`btn-primary ${isScanning ? 'loading' : ''}`}
          onClick={scanForCleanup}
          disabled={isScanning || isCleaning}
        >
          {isScanning ? '⏳ Skanowanie...' : '🔍 Skanuj System'}
        </button>

        {scanResults && (
          <>
            <button 
              className="btn-secondary"
              onClick={() => toggleAll(true)}
            >
              ✓ Zaznacz Wszystko
            </button>
            <button 
              className="btn-secondary"
              onClick={() => toggleAll(false)}
            >
              ✗ Odznacz Wszystko
            </button>
          </>
        )}
      </div>

      {scanResults && (
        <div className="scan-summary">
          <div className="summary-card">
            <div className="summary-icon">💾</div>
            <div className="summary-info">
              <h3>{Object.values(scanResults).reduce((sum, item) => sum + item.sizeMB, 0).toFixed(2)} MB</h3>
              <p>Całkowity rozmiar do wyczyszczenia</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-info">
              <h3>{Object.values(scanResults).reduce((sum, item) => sum + item.count, 0)}</h3>
              <p>Plików do usunięcia</p>
            </div>
          </div>
        </div>
      )}

      <div className="cleanup-categories">
        {cleanupCategories.map(category => {
          const result = scanResults?.[category.id];
          const isSelected = selectedItems[category.id];
          
          return (
            <div 
              key={category.id} 
              className={`cleanup-item ${isSelected ? 'selected' : ''} ${category.risk === 'moderate' ? 'moderate-risk' : ''}`}
              onClick={() => toggleItem(category.id)}
            >
              <div className="cleanup-checkbox">
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  onChange={() => {}}
                />
              </div>
              
              <div className="cleanup-icon">{category.icon}</div>
              
              <div className="cleanup-info">
                <h4>{category.name}</h4>
                <p>{category.description}</p>
                {category.risk === 'moderate' && (
                  <span className="risk-badge">⚠️ Średnie ryzyko</span>
                )}
              </div>
              
              {result && (
                <div className="cleanup-size">
                  <div className="size-value">{result.sizeMB.toFixed(2)} MB</div>
                  <div className="size-files">{result.count} plików</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {scanResults && (
        <div className="cleaner-footer">
          <button 
            className={`btn-clean ${isCleaning ? 'loading' : ''}`}
            onClick={performCleanup}
            disabled={isCleaning || Object.values(selectedItems).every(v => !v)}
          >
            {isCleaning ? '🧹 Czyszczenie...' : '🧹 Wyczyść Zaznaczone'}
          </button>
        </div>
      )}
    </div>
  );
}
