function DiskUsage({ disks, onRefresh }) {
  if (!disks || disks.length === 0) {
    return (
      <div className="disk-usage">
        <h3>💿 Użycie Dysku</h3>
        <p className="no-data">Ładowanie danych dysku...</p>
      </div>
    );
  }

  const getDiskColor = (usage) => {
    if (usage < 50) return '#43e97b';
    if (usage < 75) return '#f5576c';
    return '#f093fb';
  };

  return (
    <div className="disk-usage">
      <div className="section-header">
        <h3>💿 Użycie Dysku</h3>
        <button className="btn-icon" onClick={onRefresh} title="Odśwież">
          ↻
        </button>
      </div>
      <div className="disk-list">
        {disks.map((disk, index) => (
          <div key={index} className="disk-item">
            <div className="disk-info">
              <span className="disk-label">{disk.caption}</span>
              <span className="disk-stats">
                {disk.used} GB / {disk.total} GB
              </span>
            </div>
            <div className="disk-bar">
              <div 
                className="disk-bar-fill"
                style={{ 
                  width: `${disk.usagePercent}%`,
                  background: getDiskColor(parseFloat(disk.usagePercent))
                }}
              ></div>
            </div>
            <span className="disk-percent">{disk.usagePercent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
