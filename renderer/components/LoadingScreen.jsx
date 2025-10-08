function LoadingScreen() {
  const [progress, setProgress] = React.useState(0);
  const [loadingText, setLoadingText] = React.useState('Inicjalizacja systemu...');

  React.useEffect(() => {
    const texts = [
      'Inicjalizacja systemu...',
      'Ładowanie modułów...',
      'Przygotowanie interfejsu...',
      'Konfiguracja wydajności...',
      'Finalizacja uruchomienia...'
    ];

    let currentText = 0;
    let currentProgress = 0;

    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 12;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressInterval);
      }
      setProgress(currentProgress);

      const textIndex = Math.floor((currentProgress / 100) * texts.length);
      if (textIndex !== currentText && textIndex < texts.length) {
        currentText = textIndex;
        setLoadingText(texts[textIndex]);
      }
    }, 180);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-grid"></div>
      
      <div className="loading-content">
        <div className="loading-logo-wrapper">
          <img src="assets/Tool.png" alt="Tool" className="loading-logo" />
        </div>

        <div className="loading-progress-wrapper">
          <div className="progress-bar-outer">
            <div className="progress-bar-inner" style={{ width: `${progress}%` }}>
              <div className="progress-shine"></div>
            </div>
          </div>
          <span className="progress-percentage">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="loading-footer">
        <p>v1.0.3</p>
      </div>
    </div>
  );
}
