import { app, BrowserWindow, nativeImage } from 'electron';
import * as path from 'path';
import { initDatabase, registerIpcHandlers } from './database';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const iconPath = path.join(__dirname, '../../build/icons/icon.png');
  const icon = nativeImage.createFromPath(iconPath);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    icon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hidden',
    frame: false,
    backgroundColor: '#ffffff'
  });

  // Set dock icon on macOS
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(icon);
  }

  // 开发环境加载 Vite 开发服务器
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  initDatabase();
  registerIpcHandlers();
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
