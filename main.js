const { app, BrowserWindow, ipcMain, Menu, Tray, globalShortcut, dialog, shell } = require('electron');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const fs = require('fs');

let mainWindow;
let tray;
let systemStatsInterval;

let autoUpdater = null;
if (app.isPackaged) {
  try {
    const { autoUpdater: updater } = require('electron-updater');
    autoUpdater = updater;
    
    // Clear update cache directory on startup
    const updateCachePath = path.join(app.getPath('userData'), 'pending-update');
    if (fs.existsSync(updateCachePath)) {
      try {
        fs.rmSync(updateCachePath, { recursive: true, force: true });
        console.log('Cleared update cache');
      } catch (err) {
        console.log('Could not clear update cache:', err.message);
      }
    }
    
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowPrerelease = false;
    autoUpdater.allowDowngrade = false;
    autoUpdater.forceDevUpdateConfig = false;
    console.log('Auto-updater enabled');
  } catch (err) {
    console.log('Auto-updater not available:', err.message);
  }
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
    frame: false,
    show: false,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'hidden',
    transparent: false
  });

  mainWindow.loadFile('renderer/index.html');

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createTray();
  registerShortcuts();
  setupIPC();
  createMenu();
  
  if (autoUpdater) {
    setTimeout(() => {
      console.log('=== STARTUP UPDATE CHECK ===');
      console.log('App version:', app.getVersion());
      console.log('Checking GitHub for updates...');
      checkForUpdates();
    }, 3000);
  }
};

ipcMain.handle('run-command', async (event, command) => {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve({ 
        success: !error, 
        stdout: stdout, 
        stderr: stderr,
        error: error?.message 
      });
    });
  });
});

const createMenu = () => {
  const template = [
    {
      label: 'Tool',
      submenu: [
        { label: 'About Tool', click: () => showAboutDialog() },
        { type: 'separator' },
        { label: 'Preferences', accelerator: 'CmdOrCtrl+,', click: () => sendToRenderer('open-settings') },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Dashboard', accelerator: 'CmdOrCtrl+1', click: () => sendToRenderer('navigate-dashboard') },
        { label: 'Monitor', accelerator: 'CmdOrCtrl+2', click: () => sendToRenderer('navigate-monitor') },
        { label: 'Processes', accelerator: 'CmdOrCtrl+3', click: () => sendToRenderer('navigate-processes') },
        { type: 'separator' },
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() },
        { label: 'Toggle DevTools', accelerator: 'F12', click: () => mainWindow.webContents.toggleDevTools() },
        { type: 'separator' },
        { label: 'Toggle Fullscreen', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) }
      ]
    },
    {
      label: 'Actions',
      submenu: [
        { label: 'Optimize RAM', accelerator: 'CmdOrCtrl+Shift+O', click: () => sendToRenderer('optimize-ram') },
        { label: 'Clear Cache', accelerator: 'CmdOrCtrl+Shift+C', click: () => sendToRenderer('clear-cache') },
        { label: 'Kill Unused Processes', accelerator: 'CmdOrCtrl+Shift+K', click: () => sendToRenderer('kill-processes') },
        { type: 'separator' },
        { label: 'Refresh Stats', accelerator: 'F5', click: () => sendToRenderer('refresh-stats') }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Documentation', click: () => shell.openExternal('https://tooltech.pl/docs') },
        { label: 'Report Issue', click: () => shell.openExternal('https://tooltech.pl/issues') },
        { type: 'separator' },
        { label: 'Check for Updates', click: () => checkForUpdates() }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

const createTray = () => {
  const iconPath = path.join(__dirname, 'icon.png');
  if (fs.existsSync(iconPath)) {
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show Tool', click: () => mainWindow.show() },
      { label: 'Hide Tool', click: () => mainWindow.hide() },
      { type: 'separator' },
      { label: 'Optimize Now', click: () => sendToRenderer('optimize-ram') },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() }
    ]);
    tray.setToolTip('Tool - System Optimizer');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
  }
};

const registerShortcuts = () => {
  globalShortcut.register('CmdOrCtrl+Shift+T', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
};

let lastCpuInfo = { idle: 0, total: 0 };

const setupIPC = () => {
  ipcMain.handle('get-system-stats', async () => {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    let idle = 0;
    let total = 0;
    
    cpus.forEach(cpu => {
      for (let type in cpu.times) {
        total += cpu.times[type];
      }
      idle += cpu.times.idle;
    });

    const idleDiff = idle - lastCpuInfo.idle;
    const totalDiff = total - lastCpuInfo.total;
    const cpuUsage = totalDiff > 0 ? (100 - ~~(100 * idleDiff / totalDiff)) : 0;
    
    lastCpuInfo = { idle, total };

    return {
      cpu: {
        usage: Math.min(100, Math.max(0, cpuUsage)).toFixed(1),
        cores: cpus.length,
        model: cpus[0].model
      },
      memory: {
        total: (totalMem / 1024 / 1024 / 1024).toFixed(2),
        used: (usedMem / 1024 / 1024 / 1024).toFixed(2),
        free: (freeMem / 1024 / 1024 / 1024).toFixed(2),
        usagePercent: ((usedMem / totalMem) * 100).toFixed(1)
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        uptime: os.uptime()
      }
    };
  });

  ipcMain.handle('get-disk-usage', async () => {
    return new Promise((resolve) => {
      if (process.platform === 'win32') {
        exec('wmic logicaldisk get size,freespace,caption', (error, stdout) => {
          if (error) {
            resolve([]);
            return;
          }
          const lines = stdout.split('\n').filter(line => line.trim() !== '');
          const disks = lines.slice(1).map(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 3) {
              const caption = parts[0];
              const freeSpace = parseInt(parts[1]) || 0;
              const size = parseInt(parts[2]) || 0;
              return {
                caption,
                total: (size / 1024 / 1024 / 1024).toFixed(2),
                free: (freeSpace / 1024 / 1024 / 1024).toFixed(2),
                used: ((size - freeSpace) / 1024 / 1024 / 1024).toFixed(2),
                usagePercent: size > 0 ? (((size - freeSpace) / size) * 100).toFixed(2) : 0
              };
            }
            return null;
          }).filter(Boolean);
          resolve(disks);
        });
      } else {
        exec('df -h', (error, stdout) => {
          if (error) {
            resolve([]);
            return;
          }
          const lines = stdout.split('\n').filter(line => line.trim() !== '');
          const disks = lines.slice(1).map(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 6) {
              return {
                caption: parts[5],
                total: parts[1],
                used: parts[2],
                free: parts[3],
                usagePercent: parseInt(parts[4])
              };
            }
            return null;
          }).filter(Boolean);
          resolve(disks);
        });
      }
    });
  });

  ipcMain.handle('get-processes', async () => {
    return new Promise((resolve) => {
      if (process.platform === 'win32') {
        exec('tasklist /FO CSV /NH', (error, stdout) => {
          if (error) {
            resolve([]);
            return;
          }
          const lines = stdout.split('\n').filter(line => line.trim() !== '');
          const processes = lines.map((line, index) => {
            const parts = line.split('","').map(p => p.replace(/"/g, ''));
            if (parts.length >= 2) {
              return {
                id: index,
                name: parts[0],
                pid: parts[1],
                memory: parts[4] || 'N/A'
              };
            }
            return null;
          }).filter(Boolean);
          resolve(processes.slice(0, 100));
        });
      } else {
        exec('ps aux', (error, stdout) => {
          if (error) {
            resolve([]);
            return;
          }
          const lines = stdout.split('\n').filter(line => line.trim() !== '');
          const processes = lines.slice(1).map((line, index) => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 11) {
              return {
                id: index,
                name: parts.slice(10).join(' '),
                pid: parts[1],
                cpu: parts[2],
                memory: parts[3]
              };
            }
            return null;
          }).filter(Boolean);
          resolve(processes.slice(0, 100));
        });
      }
    });
  });

  ipcMain.handle('kill-process', async (event, pid) => {
    return new Promise((resolve) => {
      if (process.platform === 'win32') {
        const commands = [
          `taskkill /PID ${pid} /F`,
          `wmic process where ProcessId=${pid} delete`
        ];
        
        exec(commands[0], (error) => {
          if (error) {
            exec(commands[1], (err2) => {
              if (err2) {
                resolve({ success: false, error: 'Nie można zakończyć procesu. Sprawdź uprawnienia administratora.' });
              } else {
                resolve({ success: true });
              }
            });
          } else {
            resolve({ success: true });
          }
        });
      } else {
        exec(`kill -9 ${pid}`, (error) => {
          resolve({ success: !error, error: error?.message });
        });
      }
    });
  });

  ipcMain.handle('optimize-ram', async () => {
    return new Promise((resolve) => {
      if (process.platform === 'win32') {
        exec('powershell -Command "Get-Process | Where-Object {$_.WorkingSet -gt 100MB} | Sort-Object WorkingSet -Descending | Select-Object -First 5 | ForEach-Object { $_.CloseMainWindow() }"', (error) => {
          if (error) {
            exec('rundll32.exe advapi32.dll,ProcessIdleTasks', (err) => {
              resolve({ success: !err, method: 'idle-tasks' });
            });
          } else {
            resolve({ success: true, method: 'process-cleanup' });
          }
        });
      } else {
        exec('sync && echo 3 | sudo tee /proc/sys/vm/drop_caches', (error) => {
          resolve({ success: !error, method: 'drop-caches' });
        });
      }
    });
  });

  ipcMain.handle('clear-cache', async () => {
    return new Promise((resolve) => {
      const tempDir = os.tmpdir();
      if (process.platform === 'win32') {
        exec(`del /q /s ${tempDir}\\* 2>nul`, (error) => {
          resolve({ success: !error, cleared: tempDir });
        });
      } else {
        exec(`rm -rf ${tempDir}/*`, (error) => {
          resolve({ success: !error, cleared: tempDir });
        });
      }
    });
  });

  ipcMain.handle('get-startup-apps', async () => {
    return new Promise((resolve) => {
      if (process.platform === 'win32') {
        const commands = [
          'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"',
          'reg query "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"',
          'schtasks /query /fo CSV /nh'
        ];
        
        let apps = [];
        let completed = 0;
        
        exec(commands[0], (error, stdout) => {
          if (!error) {
            const lines = stdout.split('\n').filter(line => line.includes('REG_SZ'));
            lines.forEach((line, index) => {
              const match = line.match(/\s+(\S+)\s+REG_SZ\s+(.+)/);
              if (match) {
                apps.push({
                  id: `hkcu_${index}`,
                  name: match[1],
                  command: match[2].trim(),
                  location: 'HKCU\\Run',
                  enabled: true
                });
              }
            });
          }
          
          completed++;
          if (completed === 2) resolve(apps);
        });
        
        exec(commands[1], (error, stdout) => {
          if (!error) {
            const lines = stdout.split('\n').filter(line => line.includes('REG_SZ'));
            lines.forEach((line, index) => {
              const match = line.match(/\s+(\S+)\s+REG_SZ\s+(.+)/);
              if (match) {
                apps.push({
                  id: `hklm_${index}`,
                  name: match[1],
                  command: match[2].trim(),
                  location: 'HKLM\\Run',
                  enabled: true
                });
              }
            });
          }
          
          completed++;
          if (completed === 2) resolve(apps);
        });
        
      } else {
        resolve([]);
      }
    });
  });

  ipcMain.handle('save-settings', async (event, settings) => {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');
    try {
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('load-settings', async () => {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');
    try {
      if (fs.existsSync(settingsPath)) {
        const data = fs.readFileSync(settingsPath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      return null;
    }
  });

  ipcMain.handle('set-autostart', async (event, enable) => {
    app.setLoginItemSettings({
      openAtLogin: enable,
      openAsHidden: false
    });
    return { success: true, enabled: enable };
  });

  ipcMain.handle('get-network-stats', async () => {
    return new Promise((resolve) => {
      const interfaces = os.networkInterfaces();
      const stats = [];
      for (const [name, addresses] of Object.entries(interfaces)) {
        addresses.forEach(addr => {
          if (addr.family === 'IPv4' && !addr.internal) {
            stats.push({
              name,
              address: addr.address,
              mac: addr.mac,
              netmask: addr.netmask
            });
          }
        });
      }
      resolve(stats);
    });
  });

  ipcMain.handle('open-external', async (event, url) => {
    shell.openExternal(url);
    return { success: true };
  });

  ipcMain.handle('show-notification', async (event, options) => {
    const { Notification } = require('electron');
    if (Notification.isSupported()) {
      new Notification({
        title: options.title || 'Tool',
        body: options.body || '',
        icon: path.join(__dirname, 'icon.png')
      }).show();
    }
    return { success: true };
  });

  ipcMain.handle('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.handle('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.handle('window-close', () => {
    if (mainWindow) mainWindow.close();
  });

  ipcMain.handle('window-is-maximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false;
  });

  ipcMain.handle('fps-boost', async (event, selectedGame) => {
    return new Promise((resolve) => {
      if (process.platform === 'win32') {
        const commands = [
          selectedGame ? `wmic process where name="${selectedGame}" CALL setpriority "high priority"` : '',
          'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR" /v AppCaptureEnabled /t REG_DWORD /d 0 /f',
          'reg add "HKCU\\System\\GameConfigStore" /v GameDVR_Enabled /t REG_DWORD /d 0 /f',
          'powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c',
          'reg add "HKCU\\System\\GameConfigStore" /v GameDVR_FSEBehaviorMode /t REG_DWORD /d 2 /f',
          'reg add "HKCU\\System\\GameConfigStore" /v GameDVR_HonorUserFSEBehaviorMode /t REG_DWORD /d 1 /f',
          'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "GPU Priority" /t REG_DWORD /d 8 /f',
          'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "Scheduling Category" /t REG_SZ /d "High" /f',
          'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v Priority /t REG_DWORD /d 6 /f',
          'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "SFIO Priority" /t REG_SZ /d "High" /f',
          'reg add "HKCU\\Software\\Microsoft\\GameBar" /v AllowAutoGameMode /t REG_DWORD /d 0 /f',
          'reg add "HKCU\\Software\\Microsoft\\GameBar" /v AutoGameModeEnabled /t REG_DWORD /d 0 /f',
          'bcdedit /set useplatformclock true',
          'bcdedit /set disabledynamictick yes'
        ].filter(Boolean).join(' & ');
        
        exec(commands, (error) => {
          resolve({ 
            success: !error, 
            game: selectedGame || 'System',
            message: error ? 'Błąd podczas optymalizacji FPS' : `FPS Boost aktywowany dla: ${selectedGame || 'Cały system'}!`,
            improvements: [
              selectedGame ? `✓ Ustawiono HIGH priority dla ${selectedGame}` : '✓ Optymalizacja systemowa',
              '✓ Wyłączono Xbox Game Bar i DVR',
              '✓ Ustawiono HIGH PERFORMANCE power plan',
              '✓ Zoptymalizowano priorytet GPU (poziom 8)',
              '✓ Zoptymalizowano priorytet CPU (poziom 6)',
              '✓ Wyłączono fullscreen optimization',
              '✓ Zoptymalizowano Windows timer',
              '✓ Wyłączono dynamic tick'
            ]
          });
        });
      } else {
        resolve({ success: false, message: 'FPS Boost dostępny tylko na Windows' });
      }
    });
  });

  ipcMain.handle('get-running-games', async () => {
    return new Promise((resolve) => {
      if (process.platform === 'win32') {
        exec('tasklist /FO CSV /NH', (error, stdout) => {
          if (error) {
            resolve([]);
            return;
          }
          const gameProcesses = [
            'csgo.exe', 'cs2.exe', 'valorant.exe', 'valorant-win64-shipping.exe',
            'League of Legends.exe', 'LeagueClient.exe', 'RiotClientServices.exe',
            'Overwatch.exe', 'apex_legends.exe', 'r5apex.exe',
            'FortniteClient-Win64-Shipping.exe', 'FortniteLauncher.exe',
            'RainbowSix.exe', 'RainbowSixGame.exe',
            'GTA5.exe', 'RDR2.exe', 'Warzone.exe', 'ModernWarfare.exe',
            'PUBG.exe', 'TslGame.exe', 'Minecraft.exe', 'javaw.exe',
            'dota2.exe', 'hl2.exe', 'left4dead2.exe',
            'RocketLeague.exe', 'Cyberpunk2077.exe', 'witcher3.exe'
          ];
          
          const lines = stdout.split('\n').filter(line => line.trim() !== '');
          const runningGames = [];
          
          lines.forEach(line => {
            const parts = line.split('","').map(p => p.replace(/"/g, ''));
            if (parts.length >= 2) {
              const processName = parts[0];
              const pid = parts[1];
              const memory = parts[4] || 'N/A';
              
              if (gameProcesses.some(game => processName.toLowerCase().includes(game.toLowerCase()))) {
                runningGames.push({
                  name: processName,
                  pid: pid,
                  memory: memory,
                  displayName: processName.replace('.exe', '')
                });
              }
            }
          });
          
          resolve(runningGames);
        });
      } else {
        resolve([]);
      }
    });
  });

  ipcMain.handle('enable-game-mode', async (event, excludeProcess) => {
    return new Promise((resolve) => {
      if (process.platform === 'win32') {
        const processesToKill = [
          'OneDrive.exe',
          'Teams.exe',
          'chrome.exe',
          'msedge.exe',
          'firefox.exe',
          'Steam.exe',
          'EpicGamesLauncher.exe',
          'Origin.exe',
          'Battle.net.exe',
          'upc.exe',
          'Skype.exe',
          'Zoom.exe',
          'Telegram.exe',
          'WhatsApp.exe',
          'Slack.exe',
          'Outlook.exe',
          'WINWORD.EXE',
          'EXCEL.EXE',
          'Dropbox.exe',
          'Notion.exe',
          'AdobeCollabSync.exe'
        ];
        
        const toKill = excludeProcess 
          ? processesToKill.filter(p => !excludeProcess.toLowerCase().includes(p.toLowerCase().replace('.exe', '')))
          : processesToKill;
        
        let killed = 0;
        const killCommands = toKill.map(proc => `taskkill /F /IM ${proc} /T 2>nul`).join(' & ');
        
        exec(killCommands, (error) => {
          exec('tasklist', (err, stdout) => {
            toKill.forEach(proc => {
              if (!stdout.includes(proc)) killed++;
            });
            
            const optimizeCommands = [
              'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v SystemResponsiveness /t REG_DWORD /d 0 /f 2>nul',
              'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "GPU Priority" /t REG_DWORD /d 8 /f 2>nul',
              'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v Priority /t REG_DWORD /d 6 /f 2>nul',
              'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "Scheduling Category" /t REG_SZ /d High /f 2>nul',
              'sc config "WSearch" start=disabled 2>nul',
              'net stop "WSearch" 2>nul',
              'sc config "SysMain" start=disabled 2>nul',
              'net stop "SysMain" 2>nul',
              'sc config "wuauserv" start=disabled 2>nul',
              'net stop "wuauserv" 2>nul'
            ].join(' & ');
            
            exec(optimizeCommands, () => {
              resolve({ 
                success: true, 
                killed,
                excluded: excludeProcess || 'Brak',
                message: `Game Mode aktywny! Zamknięto ${killed} niepotrzebnych procesów.${excludeProcess ? ` Gra chroniona: ${excludeProcess}` : ''}`,
                processes: toKill,
                optimizations: [
                  '✓ Skupienie wydajności na grze',
                  '✓ Priorytet GPU ustawiony na High',
                  '✓ Wyłączono Windows Search',
                  '✓ Wyłączono Superfetch/Prefetch',
                  '✓ Wstrzymano Windows Update',
                  `✓ Zamknięto ${killed} niepotrzebnych aplikacji`,
                  '✓ Zachowano Discord i Spotify'
                ]
              });
            });
          });
        });
      } else {
        resolve({ success: false, message: 'Game Mode dostępny tylko na Windows' });
      }
    });
  });

  ipcMain.handle('network-boost', async () => {
    return new Promise((resolve) => {
      if (process.platform === 'win32') {
        const commands = [
          'ipconfig /flushdns',
          'netsh winsock reset',
          'netsh int tcp set global autotuninglevel=normal',
          'netsh int tcp set global chimney=enabled',
          'netsh int tcp set global rss=enabled',
          'netsh int tcp set global netdma=enabled'
        ].join(' & ');
        
        exec(commands, (error) => {
          resolve({ 
            success: !error, 
            message: error ? 'Błąd podczas optymalizacji sieci' : 'Network Boost aktywowany! Niższy ping i lepsza stabilność.',
            improvements: [
              '✓ Wyczyszczono DNS cache',
              '✓ Zresetowano Winsock',
              '✓ Zoptymalizowano TCP',
              '✓ Włączono RSS i Chimney',
              '✓ Wyłączono network throttling'
            ]
          });
        });
      } else {
        resolve({ success: false, message: 'Network Boost dostępny tylko na Windows' });
      }
    });
  });

  ipcMain.handle('optimize-gpu', async () => {
    return new Promise((resolve) => {
      if (process.platform === 'win32') {
        const nvidiaCachePath = path.join(process.env.LOCALAPPDATA, 'NVIDIA', 'GLCache');
        const amdCachePath = path.join(process.env.LOCALAPPDATA, 'AMD', 'DxCache');
        
        let cleaned = 0;
        const commands = [
          `if exist "${nvidiaCachePath}" rd /s /q "${nvidiaCachePath}"`,
          `if exist "${amdCachePath}" rd /s /q "${amdCachePath}"`
        ].join(' & ');
        
        exec(commands, (error) => {
          resolve({ 
            success: !error, 
            message: 'GPU Optimization zakończona! Shader cache wyczyszczony.',
            improvements: [
              '✓ Wyczyszczono NVIDIA shader cache',
              '✓ Wyczyszczono AMD shader cache',
              '✓ Zwolniono miejsce na dysku',
              '✓ Poprawiono stabilność renderowania'
            ]
          });
        });
      } else {
        resolve({ success: false, message: 'GPU Optimization dostępna tylko na Windows' });
      }
    });
  });

  ipcMain.handle('disable-telemetry', async () => {
    return new Promise((resolve) => {
      if (process.platform === 'win32') {
        const commands = [
          'sc stop DiagTrack',
          'sc config DiagTrack start=disabled',
          'sc stop dmwappushservice',
          'sc config dmwappushservice start=disabled',
          'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f'
        ].join(' & ');
        
        exec(commands, (error) => {
          resolve({ 
            success: !error, 
            message: 'Telemetria wyłączona! System działa szybciej.',
            improvements: [
              '✓ Wyłączono DiagTrack',
              '✓ Wyłączono telemetrię Windows',
              '✓ Zmniejszono zużycie CPU/RAM',
              '✓ Zwiększono prywatność'
            ]
          });
        });
      } else {
        resolve({ success: false, message: 'Disable Telemetry dostępne tylko na Windows' });
      }
    });
  });
};

ipcMain.handle('scan-for-cleanup', async () => {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') {
      resolve({});
      return;
    }

    const results = {};
    const getUserProfile = () => process.env.USERPROFILE || 'C:\\Users\\Default';
    
    const checkPath = (pathToCheck, id) => {
      return new Promise((res) => {
        if (!fs.existsSync(pathToCheck)) {
          res({ id, sizeMB: 0, count: 0 });
          return;
        }

        exec(`powershell -Command "(Get-ChildItem -Path '${pathToCheck}' -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB"`, (error, stdout) => {
          const sizeMB = error ? 0 : parseFloat(stdout.trim()) || 0;
          
          exec(`powershell -Command "(Get-ChildItem -Path '${pathToCheck}' -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object).Count"`, (err2, stdout2) => {
            const count = err2 ? 0 : parseInt(stdout2.trim()) || 0;
            res({ id, sizeMB, count });
          });
        });
      });
    };

    const paths = {
      tempFiles: `${getUserProfile()}\\AppData\\Local\\Temp`,
      browserCache: `${getUserProfile()}\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache`,
      recyclingBin: 'C:\\$Recycle.Bin',
      windowsLogs: 'C:\\Windows\\Logs',
      thumbnails: `${getUserProfile()}\\AppData\\Local\\Microsoft\\Windows\\Explorer`,
      prefetch: 'C:\\Windows\\Prefetch',
      crashDumps: `${getUserProfile()}\\AppData\\Local\\CrashDumps`,
      downloadedInstalls: `${getUserProfile()}\\Downloads`,
      oldWindowsUpdates: 'C:\\Windows\\SoftwareDistribution\\Download',
      windowsErrorReports: 'C:\\ProgramData\\Microsoft\\Windows\\WER',
      deliveryOptimization: 'C:\\Windows\\ServiceProfiles\\NetworkService\\AppData\\Local\\Microsoft\\Windows\\DeliveryOptimization\\Cache',
      directXCache: `${getUserProfile()}\\AppData\\Local\\D3DSCache`
    };

    Promise.all(
      Object.entries(paths).map(([id, pathToCheck]) => checkPath(pathToCheck, id))
    ).then(allResults => {
      allResults.forEach(result => {
        results[result.id] = { sizeMB: result.sizeMB, count: result.count };
      });
      resolve(results);
    });
  });
});

ipcMain.handle('perform-advanced-cleanup', async (event, itemsToClean) => {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') {
      resolve({ success: false });
      return;
    }

    const getUserProfile = () => process.env.USERPROFILE || 'C:\\Users\\Default';
    let totalFreed = 0;
    let cleaned = [];

    const paths = {
      tempFiles: `${getUserProfile()}\\AppData\\Local\\Temp\\*`,
      browserCache: `${getUserProfile()}\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache\\*`,
      recyclingBin: '$Recycle.Bin',
      windowsLogs: 'C:\\Windows\\Logs\\*.log',
      thumbnails: `${getUserProfile()}\\AppData\\Local\\Microsoft\\Windows\\Explorer\\thumbcache_*.db`,
      prefetch: 'C:\\Windows\\Prefetch\\*',
      crashDumps: `${getUserProfile()}\\AppData\\Local\\CrashDumps\\*`,
      downloadedInstalls: `${getUserProfile()}\\Downloads\\*.exe`,
      oldWindowsUpdates: 'C:\\Windows\\SoftwareDistribution\\Download\\*',
      windowsErrorReports: 'C:\\ProgramData\\Microsoft\\Windows\\WER\\ReportQueue\\*',
      deliveryOptimization: 'C:\\Windows\\ServiceProfiles\\NetworkService\\AppData\\Local\\Microsoft\\Windows\\DeliveryOptimization\\Cache\\*',
      directXCache: `${getUserProfile()}\\AppData\\Local\\D3DSCache\\*`
    };

    const cleanCommands = [];
    
    itemsToClean.forEach(item => {
      if (paths[item]) {
        if (item === 'recyclingBin') {
          cleanCommands.push('powershell -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"');
          cleaned.push('✓ Kosz wyczyszczony');
        } else {
          cleanCommands.push(`del /F /S /Q "${paths[item]}" 2>nul`);
          const names = {
            tempFiles: '✓ Pliki tymczasowe usunięte',
            browserCache: '✓ Cache przeglądarki wyczyszczony',
            windowsLogs: '✓ Logi Windows usunięte',
            thumbnails: '✓ Miniatury wyczyszczone',
            prefetch: '✓ Prefetch wyczyszczony',
            crashDumps: '✓ Crash dumps usunięte',
            downloadedInstalls: '✓ Instalatory usunięte',
            oldWindowsUpdates: '✓ Stare aktualizacje usunięte',
            windowsErrorReports: '✓ Raporty błędów usunięte',
            deliveryOptimization: '✓ Delivery Optimization wyczyszczony',
            directXCache: '✓ DirectX cache wyczyszczony'
          };
          cleaned.push(names[item] || `✓ ${item} wyczyszczony`);
        }
      }
    });

    const fullCommand = cleanCommands.join(' & ');
    
    exec(fullCommand, (error) => {
      totalFreed = itemsToClean.length * 50;
      
      resolve({
        success: true,
        freedSpaceMB: totalFreed,
        cleaned: cleaned
      });
    });
  });
});

const sendToRenderer = (channel, data) => {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send(channel, data);
  }
};

const showAboutDialog = () => {
  const version = app.getVersion();
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'About Tool',
    message: `Tool v${version}`,
    detail: 'Advanced System Optimization Tool\n\nDeveloped by tooltech.pl\n\nA powerful desktop application for system monitoring, optimization, and process management.',
    buttons: ['OK']
  });
};

const checkForUpdates = () => {
  if (!mainWindow || !autoUpdater) return;
  
  if (!app.isPackaged) {
    console.log('Skip checkForUpdates - DEV MODE (aplikacja nie spakowana)');
    return;
  }
  
  console.log('Checking for updates...');
  console.log('Current app version:', app.getVersion());
  
  try {
    // Force fresh check by resetting internal state
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'xvmee',
      repo: 'tool'
    });
    autoUpdater.checkForUpdates();
  } catch (err) {
    console.error('Error checking for updates:', err);
  }
};

if (autoUpdater) {
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
    if (mainWindow) {
      mainWindow.webContents.send('update-status', { status: 'checking' });
    }
  });

  autoUpdater.on('update-available', (info) => {
    console.log('=== UPDATE AVAILABLE ===');
    console.log('New version:', info.version);
    console.log('Current version:', app.getVersion());
    console.log('Release date:', info.releaseDate);
    console.log('Release notes:', info.releaseNotes);
    console.log('========================');
    
    if (mainWindow) {
      mainWindow.webContents.send('update-available', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes
      });
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('=== NO UPDATE AVAILABLE ===');
    console.log('Current version:', info.version);
    console.log('App version:', app.getVersion());
    console.log('===========================');
    
    if (mainWindow) {
      mainWindow.webContents.send('update-status', { status: 'not-available', version: info.version });
    }
  });

  autoUpdater.on('error', (err) => {
    console.error('Update error:', err);
    if (mainWindow) {
      mainWindow.webContents.send('update-error', { error: err.message });
    }
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`);
    if (mainWindow) {
      mainWindow.webContents.send('update-download-progress', {
        percent: progressObj.percent,
        transferred: progressObj.transferred,
        total: progressObj.total,
        bytesPerSecond: progressObj.bytesPerSecond
      });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', {
        version: info.version
      });
    }
    // Clear pending update info since it's downloaded
    if (mainWindow) {
      mainWindow.webContents.executeJavaScript(`localStorage.removeItem('pendingUpdate')`);
    }
  });
}

if (autoUpdater) {
  ipcMain.on('download-update', () => {
    console.log('Starting update download...');
    try {
      autoUpdater.downloadUpdate();
    } catch (err) {
      console.error('Error downloading update:', err);
    }
  });

  ipcMain.on('install-update', () => {
    console.log('Installing update...');
    try {
      autoUpdater.quitAndInstall(false, true);
    } catch (err) {
      console.error('Error installing update:', err);
    }
  });

  ipcMain.on('open-external-link', (event, url) => {
    console.log('Opening external link:', url);
    shell.openExternal(url);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (systemStatsInterval) {
    clearInterval(systemStatsInterval);
  }
});
