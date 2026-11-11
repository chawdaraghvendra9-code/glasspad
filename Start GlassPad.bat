@echo off
title GlassPad
cd /d "%~dp0"

if not exist "node_modules\electron\dist\electron.exe" (
  echo.
  echo   First run detected - installing GlassPad, this takes a minute...
  echo.
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo   Install failed. Make sure Node.js is installed: https://nodejs.org
    echo.
    pause
    exit /b 1
  )
)

echo   Starting GlassPad... (this window will minimize)
start "GlassPad" /min cmd /c "npm start"
exit /b 0
