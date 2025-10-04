function NetworkInfo({ networks, onRefresh }) {
  if (!networks || networks.length === 0) {
    return (
      <div className="network-info">
        <h3>🌐 Informacje Sieciowe</h3>
        <p className="no-data">Ładowanie danych sieciowych...</p>
      </div>
    );
  }

  return (
    <div className="network-info">
      <div className="section-header">
        <h3>🌐 Informacje Sieciowe</h3>
        <button className="btn-icon" onClick={onRefresh} title="Odśwież">
          ↻
        </button>
      </div>
      <div className="network-list">
        {networks.map((network, index) => (
          <div key={index} className="network-item">
            <div className="network-header">
              <span className="network-name">{network.name}</span>
              <span className="network-badge">IPv4</span>
            </div>
            <div className="network-details">
              <div className="network-detail">
                <span className="detail-label">IP:</span>
                <span className="detail-value">{network.address}</span>
              </div>
              <div className="network-detail">
                <span className="detail-label">Maska:</span>
                <span className="detail-value">{network.netmask}</span>
              </div>
              <div className="network-detail">
                <span className="detail-label">MAC:</span>
                <span className="detail-value">{network.mac}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
