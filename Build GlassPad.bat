@echo off
title GlassPad Builder
cd /d "%~dp0"

if exist "GlassPad\GlassPad.exe" (
  echo   GlassPad is already built - opening it...
  start "" explorer "GlassPad"
  pause
  exit /b 0
)

echo.
echo   Assembling GlassPad... (takes a few seconds)
echo.

if not exist "app\GlassPad-Windows.zip.001" (
  echo   Missing app\GlassPad-Windows.zip parts. Re-download the full repo ZIP.
  pause
  exit /b 1
)

copy /b "app\GlassPad-Windows.zip.001" + "app\GlassPad-Windows.zip.002" + "app\GlassPad-Windows.zip.003" + "app\GlassPad-Windows.zip.004" + "app\GlassPad-Windows.zip.005" "GlassPad-Windows.zip" >nul
if errorlevel 1 (
  echo   Joining failed. Re-download the repo ZIP and try again.
  pause
  exit /b 1
)

echo   Extracting...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -LiteralPath 'GlassPad-Windows.zip' -DestinationPath '.' -Force"
if errorlevel 1 (
  echo   Extraction failed. Run this file again.
  pause
  exit /b 1
)

del "GlassPad-Windows.zip" >nul 2>nul
del "app\GlassPad-Windows.zip.001" "app\GlassPad-Windows.zip.002" "app\GlassPad-Windows.zip.003" "app\GlassPad-Windows.zip.004" "app\GlassPad-Windows.zip.005" >nul 2>nul

echo   Done! Double-click:  GlassPad\GlassPad.exe
echo   (Tip: right-click it ^> Send to ^> Desktop to make a shortcut)
start "" explorer "GlassPad"
pause
exit /b 0
