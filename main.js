const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Use a safe temporary data path on Windows and disable GPU cache issues.
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disk-cache-dir', path.join(app.getPath('temp'), 'deepseek-agent-cache'));
app.setPath('userData', path.join(app.getPath('temp'), 'deepseek-agent-user-data'));

// Enable live-reload in development for faster iteration if electron-reload is installed
if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
  try {
    require('electron-reload')(__dirname, {
      // Ignore node_modules for performance
      ignored: /node_modules|[\\/]\./
    });
    console.log('electron-reload enabled');
  } catch (err) {
    console.warn('electron-reload not installed; run `npm install --save-dev electron-reload` to enable hot reload');
  }
}

let mainWindow;

async function searchDeepseek(query) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiEndpoint = process.env.DEEPSEEK_API_ENDPOINT || 'https://api.deepseek.example.com/v1/search';

  if (!apiKey) {
    return {
      error: true,
      message: 'Deepseek API key is missing. Set DEEPSEEK_API_KEY in your environment or provide it in the code.',
      results: []
    };
  }

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query,
        limit: 10
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Deepseek request failed:', response.status, text);
      return { error: true, message: `Deepseek request failed: ${response.status} ${text}`, results: [] };
    }

    const data = await response.json();
    return { error: false, results: data.results || [] };
  } catch (error) {
    console.error('Deepseek fetch error:', error);
    return { error: true, message: error.message || error.stack || 'Unknown error', results: [] };
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 720,
    minWidth: 840,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#0b1220',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  // Open DevTools in development for easier debugging
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
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

ipcMain.handle('deepseek-search', async (event, query) => {
  if (!query || !query.trim()) {
    return { error: true, message: 'Please enter a search query.', results: [] };
  }
  return await searchDeepseek(query.trim());
});

ipcMain.handle('window-control', (event, action) => {
  if (!mainWindow) {
    return;
  }

  switch (action) {
    case 'minimize':
      mainWindow.minimize();
      break;
    case 'maximize':
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
      break;
    case 'close':
      mainWindow.close();
      break;
  }
});
