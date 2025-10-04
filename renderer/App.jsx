const { useState, useEffect, useCallback } = React;

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [systemStats, setSystemStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'pl',
    autostart: false,
    notifications: true,
    refreshInterval: 3000
  });

  useEffect(() => {
    console.log('[App] Checking window.electronAPI:', window.electronAPI);
    console.log('[App] Checking window.api:', window.api);
    
    if (!window.electronAPI) {
      console.error('[App] window.electronAPI is not available! Preload script may not be loaded.');
      return;
    }
    
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    loadSettings();
    fetchSystemStats();
    
    const interval = setInterval(fetchSystemStats, settings.refreshInterval);
    
    window.electronAPI.onNavigateDashboard(() => setCurrentView('dashboard'));
    window.electronAPI.onNavigateMonitor(() => setCurrentView('monitor'));
    window.electronAPI.onNavigateProcesses(() => setCurrentView('processes'));
    window.electronAPI.onOpenSettings(() => setCurrentView('settings'));
    window.electronAPI.onRefreshStats(() => fetchSystemStats());
    
    window.electronAPI.onOptimizeRAM(() => handleOptimizeRAM());
    window.electronAPI.onClearCache(() => handleClearCache());
    
    return () => {
      clearInterval(interval);
      clearTimeout(loadingTimer);
    };
  }, [settings.refreshInterval]);

  const loadSettings = async () => {
    if (!window.electronAPI) {
      console.error('[App] Cannot load settings - electronAPI not available');
      document.body.className = 'dark-theme';
      return;
    }
    
    const savedSettings = await window.electronAPI.loadSettings();
    if (savedSettings) {
      setSettings(savedSettings);
      document.body.className = savedSettings.theme === 'dark' ? 'dark-theme' : 'light-theme';
    } else {
      document.body.className = 'dark-theme';
    }
  };

  const saveSettings = async (newSettings) => {
    setSettings(newSettings);
    if (window.electronAPI) {
      await window.electronAPI.saveSettings(newSettings);
    }
    document.body.className = newSettings.theme === 'dark' ? 'dark-theme' : 'light-theme';
  };

  const fetchSystemStats = async () => {
    if (!window.electronAPI) {
      console.error('[App] Cannot fetch stats - electronAPI not available');
      return;
    }
    
    try {
      const stats = await window.electronAPI.getSystemStats();
      setSystemStats(stats);
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const handleOptimizeRAM = async () => {
    addNotification('Rozpoczęto optymalizację RAM...', 'info');
    try {
      const result = await window.electronAPI.optimizeRAM();
      if (result.success) {
        addNotification('Optymalizacja RAM zakończona pomyślnie!', 'success');
        await window.electronAPI.showNotification({
          title: 'Tool',
          body: 'Optymalizacja RAM zakończona pomyślnie!'
        });
      } else {
        addNotification('Nie udało się zoptymalizować RAM', 'error');
      }
    } catch (error) {
      addNotification('Błąd podczas optymalizacji RAM', 'error');
    }
    fetchSystemStats();
  };

  const handleClearCache = async () => {
    addNotification('Czyszczenie cache...', 'info');
    try {
      const result = await window.electronAPI.clearCache();
      if (result.success) {
        addNotification('Cache wyczyszczony pomyślnie!', 'success');
        await window.electronAPI.showNotification({
          title: 'Tool',
          body: 'Cache wyczyszczony pomyślnie!'
        });
      } else {
        addNotification('Nie udało się wyczyścić cache', 'error');
      }
    } catch (error) {
      addNotification('Błąd podczas czyszczenia cache', 'error');
    }
  };

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev].slice(0, 5));
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            systemStats={systemStats}
            onOptimizeRAM={handleOptimizeRAM}
            onClearCache={handleClearCache}
            addNotification={addNotification}
          />
        );
      case 'gameboost':
        return (
          <GameBoost 
            addNotification={addNotification}
          />
        );
      case 'aihelper':
        return (
          <AIHelper />
        );
      case 'cleaner':
        return (
          <AdvancedCleaner 
            addNotification={addNotification}
          />
        );
      case 'processes':
        return (
          <ProcessList 
            addNotification={addNotification}
          />
        );
      case 'settings':
        return (
          <Settings 
            settings={settings}
            onSaveSettings={saveSettings}
            addNotification={addNotification}
          />
        );
      default:
        return <Dashboard systemStats={systemStats} />;
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app-container">
      <TitleBar />
      <div className="app-main">
        <Navigation 
          currentView={currentView}
          onNavigate={setCurrentView}
          systemStats={systemStats}
        />
        
        <main className={`main-content ${currentView === 'benchmark' ? 'fullscreen' : ''}`}>
          <NotificationCenter notifications={notifications} />
          {renderView()}
        </main>
      </div>
      <UpdateNotification />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
