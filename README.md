# GlassPad

A glassy, macOS-style **floating desktop widget** for Windows — a notepad + to-do list that lives on the edge of your screen behind a little Dynamic-Island-style notch. It never takes over your screen; it hovers above everything as a small glass card.

## Features

- **Notch** — a small pill that floats on your screen. Click it to open/close GlassPad, drag it anywhere.
- **Notes** — type anything on your mind. Everything auto-saves instantly.
- **Pages** — create as many pages as you want (☰ button → New), switch between them any time, delete the ones you don't need.
- **To-Do** — quick tasks with glowing checkboxes, clear-done, counts.
- **Always on top** — hovers above other windows (toggleable).
- **Launch at startup** — enable it in Settings (⚙) and GlassPad starts with Windows.
- **Sleep when hidden** — after 3 minutes collapsed, GlassPad drops its renderer and idles at ~50 MB RAM. Click the tray icon to wake it instantly. Toggle in Settings (⚙).
- **Tray icon** — click to show/hide, right-click to quit.
- Real **Windows 11 acrylic blur** behind the glass (falls back gracefully on older systems).

## Run it (easy way)

1. Install [Node.js](https://nodejs.org) (LTS) if you don't have it — one time only.
2. Double-click **`Start GlassPad.bat`**.
   - First run downloads Electron (~100 MB) — one time only. On slow internet this can take a few minutes; the window shows progress, so leave it open.
   - If the download gets interrupted, the launcher retries automatically — or just run it again.
   - After that it opens in a few seconds. Use **`GlassPad.vbs`** for a silent start with no console window.

To launch silently (no console flash), double-click **`GlassPad.vbs`** instead.

## Run on startup

- Open GlassPad → ⚙ Settings → turn on **Launch at startup**. Done.
- To turn it off, flip the same switch.

## Keyboard

- `Esc` — close settings / collapse back to the notch.

## RAM usage

- Collapsed for 45+ seconds (Sleep mode, on by default): **~50 MB** — the renderer and GPU are fully dropped.
- Open and in use: ~120–140 MB with **Low memory mode** on (default), which removes Chromium's GPU process entirely. If animations feel less smooth on your machine, turn it off in ⚙ Settings (the app restarts to apply).
- While you're using another app with GlassPad open, all animations pause automatically (zero CPU/GPU).
- This is the practical floor for a glassy HTML-rendered widget without installers or unsigned executables. A native compiled version could go lower but would trigger Windows SmartScreen warnings.

## Where is my data stored?

Notes and tasks are stored in Electron's user data folder
(`%APPDATA%/glasspad/Local Storage/`), so they survive restarts and reboots.

## Notes

- No installer, no `.exe` downloads — just plain scripts, so Windows SmartScreen / Security warnings won't pop up.
- If your PC lacks Node.js and you'd rather not install it, ask for a packaged portable build.
