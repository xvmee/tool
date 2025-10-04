function LoadingScreen() {
  const [progress, setProgress] = React.useState(0);
  const [loadingText, setLoadingText] = React.useState('Inicjalizacja...');

  React.useEffect(() => {
    const texts = [
      'Inicjalizacja...',
      'Ładowanie komponentów...',
      'Łączenie z systemem...',
      'Optymalizacja wydajności...',
      'Prawie gotowe...'
    ];

    let currentText = 0;
    let currentProgress = 0;

    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressInterval);
      }
      setProgress(currentProgress);

      // Change text based on progress
      const textIndex = Math.floor((currentProgress / 100) * texts.length);
      if (textIndex !== currentText && textIndex < texts.length) {
        currentText = textIndex;
        setLoadingText(texts[textIndex]);
      }
    }, 200);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-background">
        <div className="cosmic-circle circle-1"></div>
        <div className="cosmic-circle circle-2"></div>
        <div className="cosmic-circle circle-3"></div>
        <div className="stars"></div>
      </div>

      <div className="loading-content">
        <div className="loading-logo-container">
          <img src="assets/Tool.png" alt="Tool Logo" className="loading-logo" />
          <div className="logo-glow"></div>
        </div>

        <h1 className="loading-title">
          <span className="gradient-text">Tool</span>
        </h1>

        <p className="loading-subtitle">System Optimization & Gaming Boost</p>

        <div className="loading-bar-container">
          <div className="loading-bar-background">
            <div 
              className="loading-bar-fill" 
              style={{ width: `${progress}%` }}
            >
              <div className="loading-bar-shine"></div>
            </div>
          </div>
          <div className="loading-percentage">{Math.round(progress)}%</div>
        </div>

        <p className="loading-text">{loadingText}</p>

        <div className="loading-particles">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
