const { useState, useEffect } = React;

function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    checkMaximized();
  }, []);

  const checkMaximized = async () => {
    const maximized = await window.electronAPI.windowIsMaximized();
    setIsMaximized(maximized);
  };

  const handleMinimize = () => {
    window.electronAPI.windowMinimize();
  };

  const handleMaximize = async () => {
    await window.electronAPI.windowMaximize();
    checkMaximized();
  };

  const handleClose = () => {
    window.electronAPI.windowClose();
  };

  return (
    <div className="titlebar">
      <div className="titlebar-drag-region">
        <div className="titlebar-left">
          <img src="assets/Tool.png" alt="Tool" className="titlebar-logo" onError={(e) => {
            console.error('Failed to load titlebar logo');
            e.target.style.display = 'none';
          }} />
          <span className="titlebar-subtitle">System Optimizer</span>
        </div>
        <div className="titlebar-right">
          <button className="titlebar-button minimize" onClick={handleMinimize} title="Minimize">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="0" y="5" width="12" height="2" fill="currentColor" />
            </svg>
          </button>
          <button className="titlebar-button maximize" onClick={handleMaximize} title={isMaximized ? "Restore" : "Maximize"}>
            {isMaximized ? (
              <svg width="12" height="12" viewBox="0 0 12 12">
                <rect x="2" y="0" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <rect x="0" y="2" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12">
                <rect x="0" y="0" width="12" height="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            )}
          </button>
          <button className="titlebar-button close" onClick={handleClose} title="Close">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M0 0 L12 12 M12 0 L0 12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
