@echo off
setlocal enabledelayedexpansion
title FireFox-compact-mode installer

rem --- self-elevate to administrator (needed to write to Program Files) ---
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Requesting administrator rights...
  powershell -Command "Start-Process '%~f0' -Verb RunAs"
  exit /b
)

set "SCRIPT_DIR=%~dp0"

echo ==============================================
echo  FireFox-compact-mode installer (Windows)
echo ==============================================
echo.

rem --- [1] find the Firefox install directory ---
set "FF_DIR="
if exist "C:\Program Files\Mozilla Firefox\firefox.exe" set "FF_DIR=C:\Program Files\Mozilla Firefox"
if not defined FF_DIR if exist "C:\Program Files (x86)\Mozilla Firefox\firefox.exe" set "FF_DIR=C:\Program Files (x86)\Mozilla Firefox"
if not defined FF_DIR (
  for /f "delims=" %%i in ('where /r "%ProgramFiles%" firefox.exe 2^>nul') do (
    set "FF_DIR=%%~dpi"
    goto ff_found
  )
)
:ff_found
if not defined FF_DIR (
  echo ERROR: Firefox not found. Install Firefox first, then run this again.
  pause
  exit /b 1
)
echo  [1/5] Firefox install dir: %FF_DIR%

rem --- [2] find the default Firefox profile ---
set "MOZ_DIR=%APPDATA%\Mozilla\Firefox"
set "PROFILE_DIR="
for /d %%d in ("%MOZ_DIR%\*.default-release") do set "PROFILE_DIR=%%d"
if not defined PROFILE_DIR for /d %%d in ("%MOZ_DIR%\*.default") do set "PROFILE_DIR=%%d"
if not defined PROFILE_DIR (
  echo ERROR: Firefox profile not found in %MOZ_DIR%.
  echo If your profile lives elsewhere, edit this script.
  pause
  exit /b 1
)
echo  [2/5] Firefox profile: %PROFILE_DIR%

rem --- [3] copy the fx-autoconfig app-dir files ---
echo  [3/5] Installing config.js + channel-prefs.js...
copy /y "%SCRIPT_DIR%config.js" "%FF_DIR%config.js" >nul
if not exist "%FF_DIR%defaults\pref" mkdir "%FF_DIR%defaults\pref"
copy /y "%SCRIPT_DIR%channel-prefs.js" "%FF_DIR%defaults\pref\channel-prefs.js" >nul

rem --- [4] ensure the fx-autoconfig loader (chrome\utils) is present ---
if not exist "%PROFILE_DIR%\chrome\utils\boot.sys.mjs" (
  echo  [4/5] Downloading fx-autoconfig loader...
  if exist "%TEMP%\fx-autoconfig.zip" del /q "%TEMP%\fx-autoconfig.zip"
  if exist "%TEMP%\fx-autoconfig" rmdir /s /q "%TEMP%\fx-autoconfig"
  powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -Uri 'https://codeload.github.com/MrOtherGuy/fx-autoconfig/zip/refs/heads/master' -OutFile \"$env:TEMP\fx-autoconfig.zip\"; Expand-Archive -Force \"$env:TEMP\fx-autoconfig.zip\" -DestinationPath \"$env:TEMP\fx-autoconfig\" } catch { exit 1 }"
  if errorlevel 1 (
    echo   WARNING: could not download fx-autoconfig (check your connection).
    echo   Install it manually: https://github.com/MrOtherGuy/fx-autoconfig
  ) else (
    mkdir "%PROFILE_DIR%\chrome\utils" 2>nul
    xcopy /e /y /q "%TEMP%\fx-autoconfig\fx-autoconfig-master\profile\chrome\utils\*" "%PROFILE_DIR%\chrome\utils\" >nul
  )
) else (
  echo  [4/5] fx-autoconfig loader already present.
)

rem --- [5] copy the JS + CSS files ---
echo  [5/5] Copying JS + CSS files...
mkdir "%PROFILE_DIR%\chrome\JS" 2>nul
mkdir "%PROFILE_DIR%\chrome\CSS" 2>nul
copy /y "%SCRIPT_DIR%JS\*.uc.js" "%PROFILE_DIR%\chrome\JS\" >nul
copy /y "%SCRIPT_DIR%CSS\*.uc.css" "%PROFILE_DIR%\chrome\CSS\" >nul

echo.
echo ==============================================
echo  Done! Fully close Firefox and reopen it.
echo  Make sure NO firefox.exe is running first.
echo ==============================================
pause