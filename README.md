# GlassPad

A glassy, macOS-style **floating desktop widget** for Windows — a notepad + to-do list that lives on the edge of your screen behind a little Dynamic-Island-style notch. It never takes over your screen; it hovers above everything as a small glass card.

## Features

- **Notch** — a small pill that floats on your screen. Click it to open/close GlassPad, drag it anywhere.
- **Notes** — type anything on your mind. Everything auto-saves instantly.
- **Pages** — create as many pages as you want (☰ button → New), switch between them any time, delete the ones you don't need.
- **To-Do** — quick tasks with glowing checkboxes, clear-done, counts.
- **Always on top** — hovers above other windows (toggleable).
- **Launch at startup** — enable it in Settings (⚙) and GlassPad starts with Windows.
- **Tray icon** — click to show/hide, right-click to quit.
- Real **Windows 11 acrylic blur** behind the glass (falls back gracefully on older systems).

## Run it (easy way)

1. Install [Node.js](https://nodejs.org) (LTS) if you don't have it — one time only.
2. Double-click **`Start GlassPad.bat`**.
   - First run installs dependencies automatically (needs internet, ~1 min).
   - After that it opens instantly.

To launch silently (no console flash), double-click **`GlassPad.vbs`** instead.

## Run on startup

- Open GlassPad → ⚙ Settings → turn on **Launch at startup**. Done.
- To turn it off, flip the same switch.

## Keyboard

- `Esc` — close settings / collapse back to the notch.

## Where is my data stored?

Notes and tasks are stored in Electron's user data folder
(`%APPDATA%/glasspad/Local Storage/`), so they survive restarts and reboots.

## Notes

- No installer, no `.exe` downloads — just plain scripts, so Windows SmartScreen / Security warnings won't pop up.
- If your PC lacks Node.js and you'd rather not install it, ask for a packaged portable build.
