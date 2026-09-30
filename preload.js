const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  searchDeepseek: (query) => ipcRenderer.invoke('deepseek-search', query),
  windowControl: (action) => ipcRenderer.invoke('window-control', action)
});
