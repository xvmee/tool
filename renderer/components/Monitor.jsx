function Monitor({ systemStats, addNotification }) {
  const [history, setHistory] = useState({
    cpu: [],
    memory: [],
    timestamps: []
  });
  const [diskUsage, setDiskUsage] = useState([]);
  const [networkStats, setNetworkStats] = useState([]);

  useEffect(() => {
    loadDiskUsage();
    loadNetworkStats();
  }, []);

  useEffect(() => {
    if (systemStats) {
      setHistory(prev => {
        const newCpu = [...prev.cpu, parseFloat(systemStats.cpu.usage)].slice(-20);
        const newMemory = [...prev.memory, parseFloat(systemStats.memory.usagePercent)].slice(-20);
        const newTimestamps = [...prev.timestamps, new Date().toLocaleTimeString()].slice(-20);
        
        return {
          cpu: newCpu,
          memory: newMemory,
          timestamps: newTimestamps
        };
      });
    }
  }, [systemStats]);

  const loadDiskUsage = async () => {
    try {
      const disks = await window.electronAPI.getDiskUsage();
      setDiskUsage(disks);
    } catch (error) {
      console.error('Error loading disk usage:', error);
    }
  };

  const loadNetworkStats = async () => {
    try {
      const stats = await window.electronAPI.getNetworkStats();
      setNetworkStats(stats);
    } catch (error) {
      console.error('Error loading network stats:', error);
    }
  };

  const getStatusColor = (value) => {
    if (value < 50) return 'status-good';
    if (value < 75) return 'status-warning';
    return 'status-critical';
  };

  const getStatusText = (value) => {
    if (value < 50) return 'Dobry';
    if (value < 75) return 'Umiarkowany';
    return 'Krytyczny';
  };

  if (!systemStats) {
    return (
      <div className="monitor-loading">
        <div className="loading-spinner"></div>
        <p>Ładowanie danych monitoringu...</p>
      </div>
    );
  }

  return (
    <div className="monitor">
      <header className="monitor-header">
        <h1 className="gradient-text">Monitor Zasobów</h1>
        <p className="subtitle">Monitoring systemu w czasie rzeczywistym</p>
      </header>

      <div className="monitor-grid">
        <div className="monitor-card cpu-card">
          <div className="card-header">
            <h3>Procesor</h3>
            <span className={`status-badge ${getStatusColor(parseFloat(systemStats.cpu.usage))}`}>
              {getStatusText(parseFloat(systemStats.cpu.usage))}
            </span>
          </div>
          <div className="card-body">
            <CircularProgress 
              value={parseFloat(systemStats.cpu.usage)}
              size={180}
              strokeWidth={12}
              color="var(--purple-gradient)"
            />
            <div className="cpu-details">
              <div className="detail-row">
                <span className="detail-label">Model:</span>
                <span className="detail-value">{systemStats.cpu.model}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Rdzenie:</span>
                <span className="detail-value">{systemStats.cpu.cores}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Użycie:</span>
                <span className="detail-value">{systemStats.cpu.usage}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="monitor-card memory-card">
          <div className="card-header">
            <h3>Pamięć RAM</h3>
            <span className={`status-badge ${getStatusColor(parseFloat(systemStats.memory.usagePercent))}`}>
              {getStatusText(parseFloat(systemStats.memory.usagePercent))}
            </span>
          </div>
          <div className="card-body">
            <CircularProgress 
              value={parseFloat(systemStats.memory.usagePercent)}
              size={180}
              strokeWidth={12}
              color="var(--blue-gradient)"
            />
            <div className="memory-details">
              <div className="detail-row">
                <span className="detail-label">Całkowita:</span>
                <span className="detail-value">{systemStats.memory.total} GB</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Używana:</span>
                <span className="detail-value">{systemStats.memory.used} GB</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Wolna:</span>
                <span className="detail-value">{systemStats.memory.free} GB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Historia Użycia CPU</h3>
          <div className="chart-container">
            <div className="chart-bars">
              {history.cpu.map((value, index) => (
                <div key={index} className="chart-bar-wrapper">
                  <div 
                    className="chart-bar cpu-bar"
                    style={{ height: `${value}%` }}
                    title={`${value.toFixed(2)}%`}
                  ></div>
                  {index % 5 === 0 && (
                    <span className="chart-label">{history.timestamps[index]?.split(':').slice(0, 2).join(':')}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Historia Użycia RAM</h3>
          <div className="chart-container">
            <div className="chart-bars">
              {history.memory.map((value, index) => (
                <div key={index} className="chart-bar-wrapper">
                  <div 
                    className="chart-bar memory-bar"
                    style={{ height: `${value}%` }}
                    title={`${value.toFixed(2)}%`}
                  ></div>
                  {index % 5 === 0 && (
                    <span className="chart-label">{history.timestamps[index]?.split(':').slice(0, 2).join(':')}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="additional-stats">
        <DiskUsage disks={diskUsage} onRefresh={loadDiskUsage} />
        <NetworkInfo networks={networkStats} onRefresh={loadNetworkStats} />
      </div>
    </div>
  );
}
