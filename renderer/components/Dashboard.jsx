function Dashboard({ systemStats, onOptimizeRAM, onClearCache, addNotification }) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [processes, setProcesses] = useState([]);
  const [diskUsage, setDiskUsage] = useState([]);

  useEffect(() => {
    loadProcesses();
    loadDiskUsage();
  }, []);

  const loadProcesses = async () => {
    try {
      const procs = await window.electronAPI.getProcesses();
      setProcesses(procs);
    } catch (error) {
      console.error('Error loading processes:', error);
    }
  };

  const loadDiskUsage = async () => {
    try {
      const disks = await window.electronAPI.getDiskUsage();
      setDiskUsage(disks);
    } catch (error) {
      console.error('Error loading disk usage:', error);
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    await onOptimizeRAM();
    setTimeout(() => setIsOptimizing(false), 2000);
  };

  const handleClear = async () => {
    setIsClearing(true);
    await onClearCache();
    setTimeout(() => setIsClearing(false), 2000);
  };

  const handleKillProcesses = async () => {
    if (!window.confirm('Czy na pewno chcesz zamknąć nieużywane procesy? Ta operacja może zamknąć aktywne aplikacje.')) {
      return;
    }
    
    addNotification('Zamykanie nieużywanych procesów...', 'info');
    
    const processesToKill = [
      'chrome.exe',
      'msedge.exe', 
      'firefox.exe',
      'Teams.exe',
      'Skype.exe',
      'Zoom.exe',
      'OneDrive.exe'
    ];
    
    let killed = 0;
    
    for (const procName of processesToKill) {
      try {
        const proc = processes.find(p => p.name.toLowerCase() === procName.toLowerCase());
        if (proc) {
          const result = await window.electronAPI.killProcess(proc.pid);
          if (result.success) {
            killed++;
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      } catch (error) {
        console.error('Error killing process:', error);
      }
    }
    
    if (killed > 0) {
      addNotification(`Zamknięto ${killed} procesów`, 'success');
    } else {
      addNotification('Nie znaleziono procesów do zamknięcia', 'info');
    }
    
    setTimeout(() => loadProcesses(), 1000);
  };

  const handleManageStartup = () => {
    addNotification('Przechodzenie do zarządzania autostartem...', 'info');
    window.electronAPI.onOpenSettings(() => {});
    setTimeout(() => {
      const event = new Event('open-settings');
      window.dispatchEvent(event);
    }, 300);
  };

  if (!systemStats) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Ładowanie danych systemowych...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="gradient-text">Dashboard</h1>
          <p className="subtitle">Witaj w Tool - Twój system pod kontrolą</p>
        </div>
        <div className="quick-stats">
          <div className="quick-stat">
            <span className="stat-label">CPU</span>
            <span className="stat-value">{systemStats.cpu.usage}%</span>
          </div>
          <div className="quick-stat">
            <span className="stat-label">RAM</span>
            <span className="stat-value">{systemStats.memory.usagePercent}%</span>
          </div>
          <div className="quick-stat">
            <span className="stat-label">Rdzenie</span>
            <span className="stat-value">{systemStats.cpu.cores}</span>
          </div>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard
          title="Procesor"
          value={`${systemStats.cpu.usage}%`}
          subtitle={systemStats.cpu.model}
          color="purple"
          progress={parseFloat(systemStats.cpu.usage)}
        />
        <StatCard
          title="Pamięć RAM"
          value={`${systemStats.memory.used} GB`}
          subtitle={`z ${systemStats.memory.total} GB`}
          color="blue"
          progress={parseFloat(systemStats.memory.usagePercent)}
        />
        <StatCard
          title="Dysk"
          value={diskUsage.length > 0 ? `${diskUsage[0].usagePercent}%` : 'N/A'}
          subtitle={diskUsage.length > 0 ? `${diskUsage[0].used} / ${diskUsage[0].total} GB` : 'Ładowanie...'}
          color="pink"
          progress={diskUsage.length > 0 ? parseFloat(diskUsage[0].usagePercent) : 0}
        />
        <StatCard
          title="Procesy"
          value={processes.length}
          subtitle="Aktywnych procesów"
          color="green"
          progress={(processes.length / 200) * 100}
        />
      </div>

      <div className="action-grid">
        <ActionButton
          title="Optymalizuj RAM"
          description="Zwolnij pamięć i przyspiesz system"
          color="purple"
          onClick={handleOptimize}
          isLoading={isOptimizing}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <ActionButton
          title="Wyczyść Cache"
          description="Usuń tymczasowe pliki systemowe"
          color="blue"
          onClick={handleClear}
          isLoading={isClearing}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <ActionButton
          title="Zamknij Procesy"
          description="Zakończ nieużywane programy"
          color="pink"
          onClick={handleKillProcesses}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
        <ActionButton
          title="Zarządzaj Autostartem"
          description="Kontroluj programy uruchamiane przy starcie"
          color="green"
          onClick={handleManageStartup}
          gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
        />
      </div>

      <div className="info-section">
        <div className="info-card">
          <h3>ℹ️ Informacje Systemowe</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Platforma:</span>
              <span className="info-value">{systemStats.system.platform}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Architektura:</span>
              <span className="info-value">{systemStats.system.arch}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Hostname:</span>
              <span className="info-value">{systemStats.system.hostname}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Uptime:</span>
              <span className="info-value">{Math.floor(systemStats.system.uptime / 3600)}h {Math.floor((systemStats.system.uptime % 3600) / 60)}m</span>
            </div>
          </div>
        </div>

        <div className="tips-card">
          <h3>💡 Wskazówki</h3>
          <ul className="tips-list">
            <li>Regularnie optymalizuj RAM dla lepszej wydajności</li>
            <li>Monitoruj użycie procesora w zakładce Monitor</li>
            <li>Wyłącz zbędne programy z autostartu</li>
            <li>Czyść cache raz w tygodniu</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
