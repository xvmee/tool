function Benchmark() {
  const [isRunning, setIsRunning] = React.useState(false);
  const [difficulty, setDifficulty] = React.useState(null);
  const [currentTest, setCurrentTest] = React.useState(null);
  const [fps, setFps] = React.useState(0);
  const [cpuUsage, setCpuUsage] = React.useState(0);
  const [gpuUsage, setGpuUsage] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [results, setResults] = React.useState(null);
  const [particles, setParticles] = React.useState([]);
  const [systemStats, setSystemStats] = React.useState(null);
  const canvasRef = React.useRef(null);
  const animationRef = React.useRef(null);
  const lastTimeRef = React.useRef(performance.now());
  const framesRef = React.useRef([]);

  const difficulties = {
    easy: {
      name: 'Łatwy',
      description: 'Podstawowy test wydajności',
      tests: [
        { id: 'physics', name: 'Symulacja Fizyki', description: 'Test fizyki cząstek i kolizji', duration: 8000, particleCount: 300 },
        { id: 'rendering', name: 'Test Renderowania', description: 'Złożone kształty i gradienty', duration: 8000, particleCount: 500 },
        { id: 'stress', name: 'Test Obciążenia', description: 'Maksymalne obciążenie systemu', duration: 8000, particleCount: 700 }
      ]
    },
    hard: {
      name: 'Trudny',
      description: 'Zaawansowany test wydajności',
      tests: [
        { id: 'physics', name: 'Symulacja Fizyki', description: 'Intensywny test fizyki i kolizji', duration: 12000, particleCount: 800 },
        { id: 'rendering', name: 'Test Renderowania', description: 'Ekstremalnie złożone renderowanie', duration: 12000, particleCount: 1200 },
        { id: 'stress', name: 'Test Obciążenia', description: 'Maksymalne przeciążenie systemu', duration: 12000, particleCount: 1800 }
      ]
    }
  };

  // Fetch real system stats
  React.useEffect(() => {
    const fetchStats = async () => {
      if (window.electronAPI && window.electronAPI.getSystemStats) {
        const stats = await window.electronAPI.getSystemStats();
        setSystemStats(stats);
        if (isRunning) {
          setCpuUsage(parseFloat(stats.cpu.usage));
        }
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Initialize particles
  const initParticles = (count) => {
    const canvas = canvasRef.current;
    if (!canvas) return [];

    return Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      radius: Math.random() * 3 + 2,
      color: `hsl(${Math.random() * 60 + 260}, 70%, 60%)`,
      life: 1
    }));
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTimeRef.current;

    // Calculate FPS
    framesRef.current.push(currentTime);
    framesRef.current = framesRef.current.filter(t => currentTime - t < 1000);
    setFps(framesRef.current.length);

    // Clear canvas with trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    setParticles(prevParticles => {
      return prevParticles.map(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off walls
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Keep in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Draw particle with glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        prevParticles.forEach(other => {
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = `rgba(168, 85, 247, ${(1 - distance / 100) * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });

        return particle;
      });
    });

    lastTimeRef.current = currentTime;
    animationRef.current = requestAnimationFrame(animate);
  };

  // Start benchmark
  const startBenchmark = async () => {
    if (!difficulty) return;
    
    setIsRunning(true);
    setResults(null);
    const testResults = [];
    const benchmarkTests = difficulties[difficulty].tests;

    for (let i = 0; i < benchmarkTests.length; i++) {
      const test = benchmarkTests[i];
      setCurrentTest(test);
      setParticles(initParticles(test.particleCount));

      const startTime = performance.now();
      const fpsReadings = [];
      const cpuReadings = [];

      // Run test
      await new Promise(resolve => {
        const interval = setInterval(async () => {
          const elapsed = performance.now() - startTime;
          const testProgress = (elapsed / test.duration) * 100;
          setProgress(testProgress);

          // Get real CPU usage
          if (systemStats) {
            const realCpu = parseFloat(systemStats.cpu.usage);
            setCpuUsage(realCpu);
            cpuReadings.push(realCpu);
          }

          // Simulate GPU usage based on particle count
          const gpuLoad = 20 + (test.particleCount / 20) + Math.random() * 15;
          setGpuUsage(Math.min(100, gpuLoad));

          // Record FPS
          fpsReadings.push(fps);

          if (elapsed >= test.duration) {
            clearInterval(interval);
            
            // Calculate test score based on real performance
            const avgFps = fpsReadings.reduce((a, b) => a + b, 0) / fpsReadings.length;
            const minFps = Math.min(...fpsReadings.filter(f => f > 0));
            const avgCpu = cpuReadings.length > 0 
              ? cpuReadings.reduce((a, b) => a + b, 0) / cpuReadings.length 
              : 50;
            
            // Realistic scoring: FPS is main factor
            // 60 FPS = excellent, 30 FPS = acceptable, <20 FPS = poor
            const fpsScore = avgFps * 8; // Max ~480 at 60fps
            const stabilityScore = (minFps / avgFps) * 100; // Consistency bonus
            const cpuEfficiency = Math.max(0, (100 - avgCpu) * 2); // Lower CPU = better
            const score = Math.round((fpsScore * 0.7) + (stabilityScore * 0.2) + (cpuEfficiency * 0.1));

            testResults.push({
              test: test.name,
              avgFps: Math.round(avgFps),
              minFps: Math.round(minFps),
              maxFps: Math.round(Math.max(...fpsReadings)),
              avgCpu: Math.round(avgCpu),
              score
            });

            resolve();
          }
        }, 100);
      });
    }

    // Calculate overall score
    const totalScore = testResults.reduce((sum, r) => sum + r.score, 0);
    const overallScore = Math.round(totalScore / testResults.length);

    setResults({
      tests: testResults,
      overallScore,
      difficulty: difficulties[difficulty].name,
      rating: getRating(overallScore),
      timestamp: new Date().toLocaleString('pl-PL')
    });

    setIsRunning(false);
    setCurrentTest(null);
  };

  const getRating = (score) => {
    // Realistic rating based on actual performance
    // Score range: 0-500+
    if (score >= 400) return { text: 'Wyjątkowy', color: '#a855f7' }; // 60+ FPS stable
    if (score >= 300) return { text: 'Bardzo Dobry', color: '#3b82f6' }; // 45+ FPS
    if (score >= 200) return { text: 'Dobry', color: '#10b981' }; // 30+ FPS
    if (score >= 100) return { text: 'Zadowalający', color: '#f59e0b' }; // 15+ FPS
    return { text: 'Wymaga Poprawy', color: '#ef4444' }; // <15 FPS
  };

  // Start/stop animation
  React.useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, particles]);

  // Setup canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
  }, []);

  return (
    <div className="benchmark-container">
      {!isRunning && !results && (
        <div className="benchmark-start">
          <div className="benchmark-hero">
            <img src="assets/Tool.png" alt="Tool" className="benchmark-hero-logo" />
            <h1 className="gradient-text">Benchmark Tool</h1>
            <p className="benchmark-subtitle">Profesjonalny Test Wydajności Systemu</p>
          </div>

          {!difficulty ? (
            <div className="difficulty-selection">
              <h2>Wybierz Poziom Trudności</h2>
              <div className="difficulty-grid">
                <div 
                  className="difficulty-card easy"
                  onClick={() => setDifficulty('easy')}
                >
                  <div className="difficulty-icon">⚡</div>
                  <h3>{difficulties.easy.name}</h3>
                  <p>{difficulties.easy.description}</p>
                  <div className="difficulty-specs">
                    <span>3 testy</span>
                    <span>~24 sekundy</span>
                  </div>
                </div>

                <div 
                  className="difficulty-card hard"
                  onClick={() => setDifficulty('hard')}
                >
                  <div className="difficulty-icon">🔥</div>
                  <h3>{difficulties.hard.name}</h3>
                  <p>{difficulties.hard.description}</p>
                  <div className="difficulty-specs">
                    <span>3 testy</span>
                    <span>~36 sekund</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="selected-difficulty">
                <h2>Poziom: {difficulties[difficulty].name}</h2>
                <button 
                  className="btn-change-difficulty"
                  onClick={() => setDifficulty(null)}
                >
                  Zmień Poziom
                </button>
              </div>

              <div className="benchmark-tests-grid">
                {difficulties[difficulty].tests.map(test => (
                  <div key={test.id} className="benchmark-test-card">
                    <h3>{test.name}</h3>
                    <p>{test.description}</p>
                    <div className="test-specs">
                      <span className="spec-badge">{test.particleCount} cząstek</span>
                      <span className="spec-badge">{test.duration / 1000}s</span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn-start-benchmark" onClick={startBenchmark}>
                <span className="btn-icon">▶</span>
                Rozpocznij Benchmark
              </button>

              <div className="benchmark-info">
                <p>⚠️ Zamknij inne aplikacje dla dokładnych wyników</p>
                <p>⏱️ Całkowity czas testu: ~{difficulties[difficulty].tests.reduce((sum, t) => sum + t.duration, 0) / 1000} sekund</p>
              </div>
            </>
          )}
        </div>
      )}

      {isRunning && (
        <div className="benchmark-running">
          <canvas ref={canvasRef} className="benchmark-canvas" />

          <div className="benchmark-overlay">
            <div className="benchmark-header">
              <div className="benchmark-logo">
                <img src="assets/Tool.png" alt="Tool" />
                <span>Benchmark Tool</span>
              </div>

              <div className="benchmark-stats">
                <div className="stat-item">
                  <span className="stat-label">FPS</span>
                  <span className="stat-value fps-value">{fps}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">CPU</span>
                  <span className="stat-value">{Math.round(cpuUsage)}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">RAM</span>
                  <span className="stat-value">{systemStats ? systemStats.memory.usagePercent : '0'}%</span>
                </div>
              </div>
            </div>

            <div className="benchmark-current-test">
              <h3>{currentTest?.name}</h3>
              <p>{currentTest?.description}</p>
              <div className="test-progress-bar">
                <div 
                  className="test-progress-fill" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="progress-text">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      )}

      {results && (
        <div className="benchmark-results">
          <div className="results-header">
            <img src="assets/Tool.png" alt="Tool" className="results-logo" />
            <h1 className="gradient-text">Benchmark Zakończony</h1>
            <p className="results-difficulty">Poziom: {results.difficulty}</p>
            <p className="results-timestamp">{results.timestamp}</p>
          </div>

          <div className="overall-score">
            <div className="score-circle" style={{ borderColor: results.rating.color }}>
              <span className="score-value">{results.overallScore}</span>
              <span className="score-label">Wynik Końcowy</span>
            </div>
            <div className="score-rating" style={{ color: results.rating.color }}>
              {results.rating.text}
            </div>
          </div>

          <div className="results-grid">
            {results.tests.map((test, index) => (
              <div key={index} className="result-card">
                <h3>{test.test}</h3>
                <div className="result-score">
                  <span className="score-number">{test.score}</span>
                  <span className="score-points">punktów</span>
                </div>
                <div className="result-details">
                  <div className="detail-row">
                    <span>Średnie FPS:</span>
                    <span className="detail-value">{test.avgFps}</span>
                  </div>
                  <div className="detail-row">
                    <span>Min FPS:</span>
                    <span className="detail-value">{test.minFps}</span>
                  </div>
                  <div className="detail-row">
                    <span>Max FPS:</span>
                    <span className="detail-value">{test.maxFps}</span>
                  </div>
                  <div className="detail-row">
                    <span>Średnie CPU:</span>
                    <span className="detail-value">{test.avgCpu}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="btn-run-again" 
            onClick={() => {
              setResults(null);
              setProgress(0);
              setDifficulty(null);
            }}
          >
            Uruchom Ponownie
          </button>
        </div>
      )}
    </div>
  );
}
