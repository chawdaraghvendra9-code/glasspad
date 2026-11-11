const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('glasspad', {
  toggle: () => ipcRenderer.send('panel:toggle'),
  expand: () => ipcRenderer.send('panel:expand'),
  collapse: () => ipcRenderer.send('panel:collapse'),
  quit: () => ipcRenderer.send('panel:quit'),
  setOnTop: (on) => ipcRenderer.send('panel:set-top', on),
  getState: () => ipcRenderer.invoke('panel:get-state'),
  getAutostart: () => ipcRenderer.invoke('autostart:get'),
  setAutostart: (on) => ipcRenderer.send('autostart:set', on),
  getSleep: () => ipcRenderer.invoke('sleep:get'),
  setSleep: (on) => ipcRenderer.send('sleep:set', on),
  onPanelState: (cb) => ipcRenderer.on('panel-state', (_e, expanded) => cb(expanded))
});
