const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
  getDiskUsage: () => ipcRenderer.invoke('get-disk-usage'),
  getProcesses: () => ipcRenderer.invoke('get-processes'),
  killProcess: (pid) => ipcRenderer.invoke('kill-process', pid),
  optimizeRAM: () => ipcRenderer.invoke('optimize-ram'),
  clearCache: () => ipcRenderer.invoke('clear-cache'),
  getStartupApps: () => ipcRenderer.invoke('get-startup-apps'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  setAutostart: (enable) => ipcRenderer.invoke('set-autostart', enable),
  getNetworkStats: () => ipcRenderer.invoke('get-network-stats'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),
  
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  // Gaming & Performance Boosts
  fpsBoost: (selectedGame) => ipcRenderer.invoke('fps-boost', selectedGame),
  enableGameMode: (excludeProcess) => ipcRenderer.invoke('enable-game-mode', excludeProcess),
  networkBoost: () => ipcRenderer.invoke('network-boost'),
  optimizeGPU: () => ipcRenderer.invoke('optimize-gpu'),
  disableTelemetry: () => ipcRenderer.invoke('disable-telemetry'),
  getRunningGames: () => ipcRenderer.invoke('get-running-games'),
  
  // Advanced Cleanup
  scanForCleanup: () => ipcRenderer.invoke('scan-for-cleanup'),
  performAdvancedCleanup: (items) => ipcRenderer.invoke('perform-advanced-cleanup', items),
  
  // Helper
  runCommand: (command) => ipcRenderer.invoke('run-command', command),
  
  onNavigateDashboard: (callback) => {
    ipcRenderer.on('navigate-dashboard', callback);
  },
  onNavigateMonitor: (callback) => {
    ipcRenderer.on('navigate-monitor', callback);
  },
  onNavigateProcesses: (callback) => {
    ipcRenderer.on('navigate-processes', callback);
  },
  onOpenSettings: (callback) => {
    ipcRenderer.on('open-settings', callback);
  },
  onOptimizeRAM: (callback) => {
    ipcRenderer.on('optimize-ram', callback);
  },
  onClearCache: (callback) => {
    ipcRenderer.on('clear-cache', callback);
  },
  onKillProcesses: (callback) => {
    ipcRenderer.on('kill-processes', callback);
  },
  onRefreshStats: (callback) => {
    ipcRenderer.on('refresh-stats', callback);
  }
});

// Auto-updater API dla komponentu UpdateNotification
contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    const validChannels = ['download-update', 'install-update'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  on: (channel, func) => {
    const validChannels = [
      'update-status',
      'update-available',
      'update-download-progress',
      'update-downloaded',
      'update-error'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  removeAllListeners: (channel) => {
    const validChannels = [
      'update-status',
      'update-available',
      'update-download-progress',
      'update-downloaded',
      'update-error'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  }
});
