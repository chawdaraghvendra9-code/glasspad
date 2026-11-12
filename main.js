const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

const PANEL_W = 400;
const PANEL_H = 660;
const TAB_W = 36;
const TAB_H = 160;
const SLEEP_MS = 45 * 1000;

let win = null;
let tray = null;
let animTimer = null;
let expanded = false;
let pendingExpand = false;
let sleepTimer = null;
let config = { alwaysOnTop: true, sleepEnabled: true, lowMemory: true };

function loadConfig() {
  try {
    const raw = fs.readFileSync(path.join(app.getPath('userData'), 'glasspad-config.json'), 'utf8');
    const data = JSON.parse(raw);
    if (typeof data.alwaysOnTop === 'boolean') config.alwaysOnTop = data.alwaysOnTop;
    if (typeof data.sleepEnabled === 'boolean') config.sleepEnabled = data.sleepEnabled;
    if (typeof data.lowMemory === 'boolean') config.lowMemory = data.lowMemory;
  } catch (_) {}
}

loadConfig();
if (config.lowMemory) {
  try { app.disableHardwareAcceleration(); } catch (_) {}
}

function saveConfig() {
  try {
    fs.writeFileSync(
      path.join(app.getPath('userData'), 'glasspad-config.json'),
      JSON.stringify(config, null, 2)
    );
  } catch (_) {}
}

function armSleep() {
  if (sleepTimer) clearTimeout(sleepTimer);
  if (!config.sleepEnabled) return;
  sleepTimer = setTimeout(() => {
    sleepTimer = null;
    if (win && !expanded) {
      win.destroy();
      win = null;
    }
  }, SLEEP_MS);
}

function disarmSleep() {
  if (sleepTimer) { clearTimeout(sleepTimer); sleepTimer = null; }
}

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

function panelHeight() {
  const wa = screen.getPrimaryDisplay().workArea;
  return Math.max(320, Math.min(PANEL_H, wa.height - 32));
}

function tabHeight() {
  const wa = screen.getPrimaryDisplay().workArea;
  return Math.max(90, Math.min(TAB_H, wa.height - 40));
}

function notchBounds() {
  const wa = screen.getPrimaryDisplay().workArea;
  const h = tabHeight();
  return {
    x: wa.x + wa.width - TAB_W,
    y: wa.y + Math.floor((wa.height - h) / 2),
    width: TAB_W,
    height: h
  };
}

function panelBounds() {
  const wa = screen.getPrimaryDisplay().workArea;
  const h = panelHeight();
  return {
    x: wa.x + wa.width - PANEL_W - TAB_W,
    y: wa.y + Math.max(16, Math.floor((wa.height - h) / 2)),
    width: PANEL_W + TAB_W,
    height: h
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
  if (!win) {
    pendingExpand = true;
    createWindow();
    return;
  }
  const wa = screen.getPrimaryDisplay().workArea;
  if (expanded) {
    expanded = false;
    const b = win.getBounds();
    const th = tabHeight();
    const target = notchBounds();
    target.y = Math.min(Math.max(b.y, wa.y), wa.y + wa.height - th);
    target.height = th;
    animateTo(target);
    win.webContents.send('panel-state', false);
    armSleep();
  } else {
    expanded = true;
    disarmSleep();
    const b = win.getBounds();
    const ph = panelHeight();
    const target = panelBounds();
    target.y = Math.min(Math.max(b.y, wa.y), wa.y + wa.height - ph);
    target.height = ph;
    animateTo(target);
    win.webContents.send('panel-state', true);
  }
}

function quitApp() {
  disarmSleep();
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
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
      backgroundThrottling: true
    }
  });

  win.setAlwaysOnTop(config.alwaysOnTop, 'screen-saver');
  win.loadFile('index.html');

  win.once('ready-to-show', () => {
    if (!win) return;
    win.show();
    expanded = pendingExpand;
    pendingExpand = false;
    win.webContents.send('panel-state', expanded);
    if (!expanded) armSleep();
  });

  win.on('closed', () => { win = null; });
}

ipcMain.on('panel:toggle', () => togglePanel());
ipcMain.on('panel:expand', () => { if (!expanded) togglePanel(); });
ipcMain.on('panel:collapse', () => { if (expanded) togglePanel(); });
ipcMain.on('panel:quit', () => quitApp());

ipcMain.on('panel:set-top', (_e, on) => {
  config.alwaysOnTop = !!on;
  saveConfig();
  if (win) win.setAlwaysOnTop(config.alwaysOnTop, 'screen-saver');
});

ipcMain.on('sleep:set', (_e, on) => {
  config.sleepEnabled = !!on;
  saveConfig();
  if (!config.sleepEnabled) disarmSleep();
  else if (win && !expanded) armSleep();
});

ipcMain.handle('panel:get-state', () => ({ expanded, alwaysOnTop: config.alwaysOnTop }));
ipcMain.handle('sleep:get', () => config.sleepEnabled);
ipcMain.handle('lowmem:get', () => config.lowMemory);

ipcMain.on('lowmem:set', (_e, on) => {
  const next = !!on;
  if (next === config.lowMemory) return;
  config.lowMemory = next;
  saveConfig();
  try {
    app.relaunch();
    app.exit(0);
  } catch (_) {
    quitApp();
  }
});

ipcMain.handle('autostart:get', () => {
  try { return app.getLoginItemSettings().openAtLogin; } catch (_) { return false; }
});

ipcMain.on('autostart:set', (_e, on) => {
  try {
    app.setLoginItemSettings({
      openAtLogin: !!on,
      path: process.execPath,
      args: app.isPackaged ? [] : [app.getAppPath()]
    });
  } catch (_) {}
});

app.on('second-instance', () => {
  if (win) { win.show(); if (!expanded) togglePanel(); }
  else { pendingExpand = true; createWindow(); }
});

app.whenReady().then(() => {
  loadConfig();
  createWindow();
  buildTray();
  try {
    globalShortcut.register('Control+Alt+G', () => togglePanel());
  } catch (_) {}
});

app.on('will-quit', () => {
  try { globalShortcut.unregisterAll(); } catch (_) {}
});

app.on('window-all-closed', () => {
  app.quit();
});
