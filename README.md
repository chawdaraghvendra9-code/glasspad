# GlassPad

A glassy, macOS-style **floating desktop widget** for Windows — a notepad + to-do list that lives on the edge of your screen behind a little Dynamic-Island-style notch. It never takes over your screen; it hovers above everything as a small glass card.

## Features

- **Notch** — a sleek dark tab hugging the right edge of your screen, like a phone's notch turned sideways. Click anywhere on it to open/close GlassPad, drag it up or down to reposition it — it's **magnetic**: near the top or bottom corner it snaps flush into the corner.
- **Notes** — type anything on your mind. Everything auto-saves instantly.
- **Pages** — create as many pages as you want (☰ button → New), switch between them any time, delete the ones you don't need.
- **To-Do** — quick tasks with glowing checkboxes, clear-done, counts.
- **Always on top** — hovers above other windows (toggleable).
- **Launch at startup** — enable it in Settings (⚙) and GlassPad starts with Windows.
- **Sleep when hidden** — after 3 minutes collapsed, GlassPad drops its renderer and idles at ~50 MB RAM. Click the tray icon to wake it instantly. Toggle in Settings (⚙).
- **Tray icon** — click to show/hide, right-click to quit.
- **Global hotkey** — `Ctrl+Alt+G` opens/closes GlassPad from anywhere.
- Deep **glass layering** — translucent gradients, highlights and film grain for the macOS vibe.

## Run it (extract → one click — that's it)

1. Click the green **Code** button → **Download ZIP** (the app is included, ~100 MB).
2. Extract the ZIP anywhere.
3. Double-click **`RUN GLASSPAD.bat`**.

First click assembles the app (~5 seconds) and opens it. Every click after that launches instantly.

Tip: once assembled, right-click `GlassPad\GlassPad.exe` → **Send to → Desktop (create shortcut)**.

> If Windows SmartScreen shows a blue prompt on first run, click **More info → Run anyway**. That only appears because the app isn't from the Microsoft Store — not because anything is wrong.

## Run it from source (developers)

1. Install [Node.js](https://nodejs.org) (LTS).
2. Double-click **`Start GlassPad.bat`** — first run downloads Electron automatically, then it opens instantly. Use **`GlassPad.vbs`** for a silent start.

(`RUN GLASSPAD.bat` is for the portable version; source users can ignore the `app/` folder.)

To launch silently (no console flash), double-click **`GlassPad.vbs`** instead.

## Run on startup

- Open GlassPad → ⚙ Settings → turn on **Launch at startup**. Done.
- To turn it off, flip the same switch.

## Keyboard

- `Esc` — close settings / collapse back to the notch.
- `Ctrl+Alt+G` — toggle GlassPad from anywhere (works even when collapsed/asleep).

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
