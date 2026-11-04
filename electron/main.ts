import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { processManager, QuestPreset, WindowMode } from './processManager';

let mainWindow: BrowserWindow | null = null;

// Ensure Windows Taskbar uses XQuest identity and custom icon
if (process.platform === 'win32') {
  app.setAppUserModelId('com.xxraay.xquest');
}

function getCustomPresetsPath(): string {
  return path.join(app.getPath('userData'), 'custom_presets.json');
}

function loadSavedPresets(): QuestPreset[] {
  const p = getCustomPresetsPath();
  if (fs.existsSync(p)) {
    try {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (Array.isArray(data)) return data;
    } catch (err) {
      console.error('[XQuest] Failed to read custom presets:', err);
    }
  }
  return [];
}

function saveSavedPresets(presets: QuestPreset[]): void {
  const p = getCustomPresetsPath();
  try {
    fs.writeFileSync(p, JSON.stringify(presets, null, 2), 'utf8');
  } catch (err) {
    console.error('[XQuest] Failed to write custom presets:', err);
  }
}

function getAppIcon(): string {
  const candidates = [
    path.join(__dirname, '../public/icon.ico'),
    path.join(__dirname, '../dist/icon.ico'),
    path.join(__dirname, '../public/icon.png'),
    path.join(__dirname, '../dist/icon.png'),
    path.join(process.cwd(), 'public/icon.ico'),
    path.join(process.cwd(), 'public/icon.png'),
  ];
  return candidates.find((p) => fs.existsSync(p)) || '';
}

function createWindow(): void {
  const iconPath = getAppIcon();

  mainWindow = new BrowserWindow({
    width: 1080,
    height: 780,
    minWidth: 960,
    minHeight: 640,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#06070a',
    icon: iconPath || undefined,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  processManager.setOnStateChange((state) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('emulation-state-changed', state);
    }
  });

  const distHtml = path.join(__dirname, '../dist/index.html');

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (fs.existsSync(distHtml)) {
    mainWindow.loadFile(distHtml);
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    processManager.stopEmulation();
  });
}

// Window control handlers
ipcMain.on('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window:close', () => {
  mainWindow?.close();
});

// Emulation handlers
ipcMain.handle('emulator:start', async (_event, params: {
  preset: QuestPreset;
  windowMode: WindowMode;
  durationMinutes: number;
  autoStop: boolean;
  soundAlert: boolean;
}) => {
  return await processManager.startEmulation(params);
});

ipcMain.handle('emulator:stop', async () => {
  return await processManager.stopEmulation();
});

ipcMain.handle('emulator:get-status', () => {
  return processManager.state;
});

ipcMain.handle('emulator:check-discord', () => {
  return processManager.checkDiscordRunning();
});

ipcMain.handle('emulator:get-presets', () => {
  return loadSavedPresets();
});

ipcMain.handle('emulator:save-custom-preset', (_event, preset: QuestPreset) => {
  const current = loadSavedPresets();
  const filtered = current.filter((p) => p.id !== preset.id);
  saveSavedPresets([preset, ...filtered]);
  return { success: true };
});

ipcMain.handle('emulator:delete-custom-preset', (_event, id: string) => {
  const current = loadSavedPresets();
  saveSavedPresets(current.filter((p) => p.id !== id));
  return { success: true };
});

ipcMain.handle('emulator:open-stub-window', () => {
  // Focus dummy window if running
  return { success: true };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  processManager.stopEmulation();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
