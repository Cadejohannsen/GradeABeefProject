@echo off
setlocal enabledelayedexpansion
title Grade-A-Beef
set PROJECT_DIR=%~dp0
set PORT=3000

:: Check if server is already running on port 3000
curl -s --max-time 1 http://localhost:%PORT% >nul 2>&1
if !errorlevel!==0 (
    echo Server already running, opening browser...
    start "" http://localhost:%PORT%
    exit /b 0
)

:: Start the dev server in a minimized background window
echo Starting Grade-A-Beef server...
start "Grade-A-Beef Server" /min cmd /c "cd /d "%PROJECT_DIR%" && npm run dev"

:: Poll until the server responds (up to 60 seconds)
for /l %%i in (1,1,60) do (
    timeout /t 1 /nobreak >nul
    curl -s --max-time 1 http://localhost:%PORT% >nul 2>&1
    if !errorlevel!==0 (
        echo Ready! Opening http://localhost:%PORT%
        start "" http://localhost:%PORT%
        exit /b 0
    )
)

echo Server did not start in time. Check the server window for errors.
pause
