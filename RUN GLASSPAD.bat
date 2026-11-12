@echo off
title GlassPad
cd /d "%~dp0"

if exist "GlassPad\GlassPad.exe" goto run

echo   First run: assembling GlassPad (a few seconds)...

if not exist "app\GlassPad-Windows.zip.001" (
  echo.
  echo   Missing app parts. Re-download the full repo ZIP and extract it,
  echo   then run this file again from inside the extracted folder.
  echo.
  pause
  exit /b 1
)

copy /b "app\GlassPad-Windows.zip.001" + "app\GlassPad-Windows.zip.002" + "app\GlassPad-Windows.zip.003" + "app\GlassPad-Windows.zip.004" + "app\GlassPad-Windows.zip.005" "GlassPad-Windows.zip" >nul
if errorlevel 1 goto fail

powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -LiteralPath 'GlassPad-Windows.zip' -DestinationPath '.' -Force"
if errorlevel 1 goto fail

del "GlassPad-Windows.zip" >nul 2>nul
del "app\GlassPad-Windows.zip.001" "app\GlassPad-Windows.zip.002" "app\GlassPad-Windows.zip.003" "app\GlassPad-Windows.zip.004" "app\GlassPad-Windows.zip.005" >nul 2>nul

echo   Done!
goto run

:fail
echo.
echo   Setup failed. Delete this folder, re-download the repo ZIP,
echo   extract, and run this file again.
echo.
pause
exit /b 1

:run
start "" "%~dp0GlassPad\GlassPad.exe"
exit /b 0
