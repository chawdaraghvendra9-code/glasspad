@echo off
title GlassPad
cd /d "%~dp0"

if exist "node_modules\electron\dist\electron.exe" goto run

echo.
echo   ==================================================
echo    GlassPad first-time setup
echo    Downloading Electron (~100 MB) - ONE TIME ONLY
echo    On slower internet this can take a few minutes.
echo    Progress is shown below - do not close this window.
echo   ==================================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo   npm was not found. Please install Node.js from:
  echo   https://nodejs.org   then run this file again.
  echo.
  pause
  exit /b 1
)

call npm install --no-audit --no-fund --loglevel=error
if errorlevel 1 goto fail

if not exist "node_modules\electron\dist\electron.exe" (
  echo.
  echo   Download looks incomplete - retrying once...
  echo.
  call npm install --no-audit --no-fund --loglevel=error
  if errorlevel 1 goto fail
)

if not exist "node_modules\electron\dist\electron.exe" goto fail

echo.
echo   Setup complete! Starting GlassPad...
echo   Next time it opens instantly ^(use GlassPad.vbs for silent start^).
goto run

:fail
echo.
echo   Setup failed. Check your internet connection and run this file again.
echo   If it keeps failing, install Node.js from https://nodejs.org
echo.
pause
exit /b 1

:run
echo   Starting GlassPad... (this window will minimize)
start "GlassPad" /min cmd /c "npm start"
timeout /t 2 >nul
exit /b 0
