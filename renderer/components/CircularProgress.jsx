function CircularProgress({ value, size = 120, strokeWidth = 8, color = '#667eea' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="circle-background"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="circle-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={color}
        />
      </svg>
      <div className="progress-text">
        <span className="progress-value">{value.toFixed(1)}</span>
        <span className="progress-unit">%</span>
      </div>
    </div>
  );
}
