function ProcessList({ addNotification }) {
  const [processes, setProcesses] = useState([]);
  const [filteredProcesses, setFilteredProcesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProcesses();
    const interval = setInterval(loadProcesses, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAndSortProcesses();
  }, [processes, searchTerm, sortBy, sortOrder]);

  const loadProcesses = async () => {
    try {
      const procs = await window.electronAPI.getProcesses();
      setProcesses(procs);
    } catch (error) {
      console.error('Error loading processes:', error);
      addNotification('Błąd podczas ładowania procesów', 'error');
    }
  };

  const filterAndSortProcesses = () => {
    let filtered = processes.filter(proc => 
      proc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.pid.toString().includes(searchTerm)
    );

    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'memory' || sortBy === 'cpu') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredProcesses(filtered);
  };

  const handleKillProcess = async (pid, name) => {
    if (!window.confirm(`Czy na pewno chcesz zakończyć proces "${name}" (PID: ${pid})?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.electronAPI.killProcess(pid);
      if (result.success) {
        addNotification(`Proces "${name}" został zakończony`, 'success');
        loadProcesses();
      } else {
        addNotification(`Nie udało się zakończyć procesu: ${result.error}`, 'error');
      }
    } catch (error) {
      addNotification('Błąd podczas kończenia procesu', 'error');
    }
    setIsLoading(false);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="process-list">
      <header className="process-header">
        <div className="header-content">
          <h1 className="gradient-text">Menedżer Procesów <span className="beta-badge">BETA</span></h1>
          <p className="subtitle">Zarządzaj uruchomionymi procesami</p>
        </div>
        <div className="process-controls">
          <input 
            type="text"
            placeholder="Szukaj procesów..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="process-search"
          />
          <button 
            className="btn-refresh"
            onClick={loadProcesses}
            disabled={isLoading}
          >
            ↻ Odśwież
          </button>
        </div>
      </header>

      <div className="process-stats">
        <div className="stat-badge">
          <span className="badge-label">Wszystkie procesy:</span>
          <span className="badge-value">{processes.length}</span>
        </div>
        <div className="stat-badge">
          <span className="badge-label">Wyświetlane:</span>
          <span className="badge-value">{filteredProcesses.length}</span>
        </div>
      </div>

      <div className="process-table-container">
        <table className="process-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                Nazwa {getSortIcon('name')}
              </th>
              <th onClick={() => handleSort('pid')} className="sortable">
                PID {getSortIcon('pid')}
              </th>
              <th onClick={() => handleSort('memory')} className="sortable">
                Pamięć {getSortIcon('memory')}
              </th>
              <th>Akcja</th>
            </tr>
          </thead>
          <tbody>
            {filteredProcesses.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-processes">
                  {searchTerm ? 'Nie znaleziono procesów' : 'Ładowanie procesów...'}
                </td>
              </tr>
            ) : (
              filteredProcesses.map((proc) => (
                <tr key={proc.id} className="process-row">
                  <td className="process-name" title={proc.name}>{proc.name}</td>
                  <td className="process-pid">{proc.pid}</td>
                  <td className="process-memory">{proc.memory}</td>
                  <td className="process-actions">
                    <button 
                      className="btn-kill"
                      onClick={() => handleKillProcess(proc.pid, proc.name)}
                      disabled={isLoading}
                      title="Zakończ proces"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="process-footer">
        <p className="warning-text">
          ⚠️ Uwaga: Zakończenie krytycznych procesów systemowych może spowodować niestabilność systemu
        </p>
      </div>
    </div>
  );
}
