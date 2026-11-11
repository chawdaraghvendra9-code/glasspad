const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

const PANEL_W = 400;
const PANEL_H = 660;
const NOTCH_W = 190;
const NOTCH_H = 46;
const MARGIN = 16;

let win = null;
let tray = null;
let animTimer = null;
let expanded = false;
let alwaysOnTop = true;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

function clampToWorkArea(b) {
  const wa = screen.getPrimaryDisplay().workArea;
  const x = Math.min(Math.max(b.x, wa.x), wa.x + wa.width - b.width);
  const y = Math.min(Math.max(b.y, wa.y), wa.y + wa.height - b.height);
  return { x, y, width: b.width, height: b.height };
}

function notchBounds() {
  const wa = screen.getPrimaryDisplay().workArea;
  return {
    x: wa.x + wa.width - NOTCH_W - MARGIN,
    y: wa.y + Math.floor((wa.height - NOTCH_H) / 2),
    width: NOTCH_W,
    height: NOTCH_H
  };
}

function panelBounds() {
  const wa = screen.getPrimaryDisplay().workArea;
  return {
    x: wa.x + wa.width - PANEL_W - MARGIN,
    y: wa.y + Math.max(20, Math.floor((wa.height - PANEL_H) / 2)),
    width: PANEL_W,
    height: PANEL_H
  };
}

function animateTo(target) {
  if (!win) return;
  if (animTimer) clearInterval(animTimer);
  const from = win.getBounds();
  const steps = 9;
  let i = 0;
  animTimer = setInterval(() => {
    if (!win) { clearInterval(animTimer); return; }
    i++;
    const t = Math.min(1, i / steps);
    const e = 1 - Math.pow(1 - t, 3);
    win.setBounds({
      x: Math.round(from.x + (target.x - from.x) * e),
      y: Math.round(from.y + (target.y - from.y) * e),
      width: Math.round(from.width + (target.width - from.width) * e),
      height: Math.round(from.height + (target.height - from.height) * e)
    });
    if (t >= 1) {
      clearInterval(animTimer);
      animTimer = null;
      try { win.setBounds(clampToWorkArea(target)); } catch (_) {}
    }
  }, 12);
}

function makeTrayIcon() {
  const size = 32;
  const buf = Buffer.alloc(size * size * 4);
  const r = 9;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const cx = Math.min(Math.max(x, r), size - 1 - r);
      const cy = Math.min(Math.max(y, r), size - 1 - r);
      const inside = (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r;
      if (inside) {
        const shade = 235 - Math.floor((y / size) * 40);
        buf[i] = 255;
        buf[i + 1] = shade;
        buf[i + 2] = shade + 8 > 255 ? 255 : shade + 8;
        buf[i + 3] = 255;
      } else {
        buf[i + 3] = 0;
      }
    }
  }
  return nativeImage.createFromBitmap(buf, { width: size, height: size });
}

function buildTray() {
  try {
    tray = new Tray(makeTrayIcon());
    tray.setToolTip('GlassPad');
    tray.on('click', () => togglePanel());
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Show / Hide', click: () => togglePanel() },
      { type: 'separator' },
      { label: 'Quit GlassPad', click: () => quitApp() }
    ]));
  } catch (_) {
    tray = null;
  }
}

function togglePanel() {
  if (!win) return;
  if (expanded) {
    expanded = false;
    const b = win.getBounds();
    animateTo(clampToWorkArea({ x: b.x + Math.floor((b.width - NOTCH_W) / 2), y: b.y, width: NOTCH_W, height: NOTCH_H }));
    win.webContents.send('panel-state', false);
  } else {
    expanded = true;
    const b = win.getBounds();
    animateTo(clampToWorkArea({ x: b.x + Math.floor((NOTCH_W - PANEL_W) / 2), y: b.y, width: PANEL_W, height: PANEL_H }));
    win.webContents.send('panel-state', true);
  }
}

function quitApp() {
  if (tray) { try { tray.destroy(); } catch (_) {} tray = null; }
  app.quit();
}

function createWindow() {
  const start = notchBounds();
  win = new BrowserWindow({
    ...start,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    skipTaskbar: true,
    hasShadow: false,
    alwaysOnTop: true,
    fullscreenable: false,
    maximizable: false,
    backgroundColor: '#00000000',
    backgroundMaterial: 'acrylic',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false
    }
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.loadFile('index.html');

  win.once('ready-to-show', () => {
    win.show();
    win.webContents.send('panel-state', false);
  });

  win.on('closed', () => { win = null; });
}

ipcMain.on('panel:toggle', () => togglePanel());
ipcMain.on('panel:expand', () => { if (!expanded) togglePanel(); });
ipcMain.on('panel:collapse', () => { if (expanded) togglePanel(); });
ipcMain.on('panel:quit', () => quitApp());

ipcMain.on('panel:set-top', (_e, on) => {
  alwaysOnTop = !!on;
  if (win) win.setAlwaysOnTop(alwaysOnTop, 'screen-saver');
});

ipcMain.handle('panel:get-state', () => ({ expanded, alwaysOnTop }));

ipcMain.handle('autostart:get', () => {
  try { return app.getLoginItemSettings().openAtLogin; } catch (_) { return false; }
});

ipcMain.on('autostart:set', (_e, on) => {
  try {
    app.setLoginItemSettings({
      openAtLogin: !!on,
      path: process.execPath,
      args: [app.getAppPath()]
    });
  } catch (_) {}
});

app.on('second-instance', () => {
  if (win) { win.show(); if (!expanded) togglePanel(); }
});

app.whenReady().then(() => {
  createWindow();
  buildTray();
});

app.on('window-all-closed', () => {
  app.quit();
});
