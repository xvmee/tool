function GameBoost({ addNotification }) {
  const [isLoading, setIsLoading] = React.useState({});
  const [runningGames, setRunningGames] = React.useState([]);
  const [selectedGame, setSelectedGame] = React.useState('');
  const [showGameSelector, setShowGameSelector] = React.useState(false);

  // Load running games on component mount
  React.useEffect(() => {
    loadRunningGames();
  }, []);

  const loadRunningGames = async () => {
    try {
      const games = await window.electronAPI.getRunningGames();
      setRunningGames(games);
      if (games.length > 0 && !selectedGame) {
        setSelectedGame(games[0].name);
      }
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const handleFPSBoost = async () => {
    if (!selectedGame && runningGames.length > 0) {
      setShowGameSelector(true);
      addNotification('Wybierz grę do boostowania', 'info');
      return;
    }

    setIsLoading(prev => ({ ...prev, fps: true }));
    addNotification(`Aktywacja FPS Boost dla ${selectedGame || 'systemu'}...`, 'info');
    
    try {
      const result = await window.electronAPI.fpsBoost(selectedGame);
      if (result.success) {
        addNotification(result.message, 'success');
        result.improvements?.forEach((imp, i) => {
          setTimeout(() => addNotification(imp, 'success'), (i + 1) * 300);
        });
      } else {
        addNotification(result.message, 'error');
      }
    } catch (error) {
      addNotification('Błąd podczas FPS Boost', 'error');
    }
    
    setIsLoading(prev => ({ ...prev, fps: false }));
    setShowGameSelector(false);
  };

  const handleGameMode = async () => {
    setIsLoading(prev => ({ ...prev, game: true }));
    addNotification('Włączanie Game Mode...', 'info');
    
    try {
      const result = await window.electronAPI.enableGameMode(selectedGame);
      if (result.success) {
        addNotification(result.message, 'success');
        result.optimizations?.forEach((opt, i) => {
          setTimeout(() => addNotification(opt, 'success'), (i + 1) * 300);
        });
      } else {
        addNotification(result.message, 'error');
      }
    } catch (error) {
      addNotification('Błąd podczas Game Mode', 'error');
    }
    
    setIsLoading(prev => ({ ...prev, game: false }));
  };

  const handleNetworkBoost = async () => {
    setIsLoading(prev => ({ ...prev, network: true }));
    addNotification('Optymalizacja sieci...', 'info');
    
    try {
      const result = await window.electronAPI.networkBoost();
      if (result.success) {
        addNotification(result.message, 'success');
        result.improvements?.forEach((imp, i) => {
          setTimeout(() => addNotification(imp, 'success'), (i + 1) * 300);
        });
      } else {
        addNotification(result.message, 'error');
      }
    } catch (error) {
      addNotification('Błąd podczas Network Boost', 'error');
    }
    
    setIsLoading(prev => ({ ...prev, network: false }));
  };

  const handleGPUOptimize = async () => {
    setIsLoading(prev => ({ ...prev, gpu: true }));
    addNotification('Optymalizacja GPU...', 'info');
    
    try {
      const result = await window.electronAPI.optimizeGPU();
      if (result.success) {
        addNotification(result.message, 'success');
        result.improvements?.forEach((imp, i) => {
          setTimeout(() => addNotification(imp, 'success'), (i + 1) * 300);
        });
      } else {
        addNotification(result.message, 'error');
      }
    } catch (error) {
      addNotification('Błąd podczas optymalizacji GPU', 'error');
    }
    
    setIsLoading(prev => ({ ...prev, gpu: false }));
  };

  const handleDisableTelemetry = async () => {
    setIsLoading(prev => ({ ...prev, telemetry: true }));
    addNotification('Wyłączanie telemetrii...', 'info');
    
    try {
      const result = await window.electronAPI.disableTelemetry();
      if (result.success) {
        addNotification(result.message, 'success');
        result.improvements?.forEach((imp, i) => {
          setTimeout(() => addNotification(imp, 'success'), (i + 1) * 300);
        });
      } else {
        addNotification(result.message, 'error');
      }
    } catch (error) {
      addNotification('Błąd podczas wyłączania telemetrii', 'error');
    }
    
    setIsLoading(prev => ({ ...prev, telemetry: false }));
  };

  return (
    <div className="game-boost">
      <div className="boost-header">
        <h2>⚡ Gaming & Performance</h2>
        <p>Maksymalna wydajność dla gier i aplikacji</p>
        
        {runningGames.length > 0 && (
          <div className="game-selector">
            <label htmlFor="game-select">Wybierz grę do ochrony/boostowania:</label>
            <select 
              id="game-select"
              value={selectedGame} 
              onChange={(e) => setSelectedGame(e.target.value)}
              className="game-select-dropdown"
            >
              <option value="">Brak (optymalizacja systemowa)</option>
              {runningGames.map(game => (
                <option key={game.name} value={game.name}>
                  {game.displayName} ({Math.round(game.memory / 1024 / 1024)} MB)
                </option>
              ))}
            </select>
            <button 
              className="refresh-games-btn"
              onClick={loadRunningGames}
              title="Odśwież listę gier"
            >
              🔄
            </button>
          </div>
        )}
      </div>

      <div className="boost-grid">
        <div className="boost-card">
          <div className="boost-icon">🎮</div>
          <h3>FPS Boost</h3>
          <p>Optymalizacja GPU i CPU dla wyższych FPS</p>
          <ul className="boost-features">
            <li>Wyłącz Xbox Game Bar</li>
            <li>Tryb wysokiej wydajności</li>
            <li>Priorytet GPU/CPU dla gry</li>
            <li>Fullscreen optimization</li>
          </ul>
          <button 
            className={`boost-button ${isLoading.fps ? 'loading' : ''}`}
            onClick={handleFPSBoost}
            disabled={isLoading.fps}
          >
            {isLoading.fps ? 'Aktywacja...' : `Boostuj${selectedGame ? ': ' + selectedGame.replace('.exe', '') : ''}`}
          </button>
        </div>

        <div className="boost-card">
          <div className="boost-icon">🚀</div>
          <h3>Game Mode</h3>
          <p>Zamknij niepotrzebne procesy w tle</p>
          <ul className="boost-features">
            <li>Zamknij Chrome/Edge/Firefox</li>
            <li>Zamknij Discord/Teams/Spotify</li>
            <li>Wstrzymaj Windows Update</li>
            <li>Wyłącz Windows Search{selectedGame && <li className="protected-game">✓ Ochrona: {selectedGame.replace('.exe', '')}</li>}</li>
          </ul>
          <button 
            className={`boost-button ${isLoading.game ? 'loading' : ''}`}
            onClick={handleGameMode}
            disabled={isLoading.game}
          >
            {isLoading.game ? 'Włączanie...' : 'Włącz Game Mode'}
          </button>
        </div>

        <div className="boost-card">
          <div className="boost-icon">🌐</div>
          <h3>Network Boost</h3>
          <p>Niższy ping i lepsza stabilność</p>
          <ul className="boost-features">
            <li>Flush DNS cache</li>
            <li>Reset Winsock</li>
            <li>Optymalizacja TCP</li>
            <li>Wyłącz throttling</li>
          </ul>
          <button 
            className={`boost-button ${isLoading.network ? 'loading' : ''}`}
            onClick={handleNetworkBoost}
            disabled={isLoading.network}
          >
            {isLoading.network ? 'Optymalizacja...' : 'Optymalizuj Sieć'}
          </button>
        </div>

        <div className="boost-card">
          <div className="boost-icon">🎨</div>
          <h3>GPU Optimization</h3>
          <p>Wyczyść shader cache i popraw rendering</p>
          <ul className="boost-features">
            <li>NVIDIA shader cache</li>
            <li>AMD shader cache</li>
            <li>Zwolnij miejsce</li>
            <li>Stabilność renderingu</li>
          </ul>
          <button 
            className={`boost-button ${isLoading.gpu ? 'loading' : ''}`}
            onClick={handleGPUOptimize}
            disabled={isLoading.gpu}
          >
            {isLoading.gpu ? 'Czyszczenie...' : 'Optymalizuj GPU'}
          </button>
        </div>

        <div className="boost-card">
          <div className="boost-icon">🔒</div>
          <h3>Disable Telemetry</h3>
          <p>Wyłącz telemetrię Windows dla prywatności</p>
          <ul className="boost-features">
            <li>Wyłącz DiagTrack</li>
            <li>Wyłącz zbieranie danych</li>
            <li>Zmniejsz zużycie RAM</li>
            <li>Zwiększ prywatność</li>
          </ul>
          <button 
            className={`boost-button ${isLoading.telemetry ? 'loading' : ''}`}
            onClick={handleDisableTelemetry}
            disabled={isLoading.telemetry}
          >
            {isLoading.telemetry ? 'Wyłączanie...' : 'Wyłącz Telemetrię'}
          </button>
        </div>
      </div>

      <div className="boost-info">
        <div className="info-icon">ℹ️</div>
        <div className="info-text">
          <strong>Uwaga:</strong> Niektóre funkcje wymagają uprawnień administratora. 
          Uruchom aplikację jako administrator dla pełnej funkcjonalności.
        </div>
      </div>
    </div>
  );
}
