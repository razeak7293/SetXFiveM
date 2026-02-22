@echo off
TITLE Set Shop API Server
echo =========================================
echo   SET SHOP API AUTO-START
echo =========================================

:: Check for Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed!
    echo Please download and install from: https://nodejs.org/
    echo Once installed, restart this script.
    pause
    exit
)

echo [INFO] Node.js detected.
echo [INFO] Starting Server...

cd /d "%~dp0backend"
npm start

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server failed to start!
    echo Possible reasons:
    echo 1. You haven't run "npm install" in the backend folder.
    echo 2. Another program is using port 3000.
    echo 3. Missing files.
    echo.
    echo Let's try to install dependencies automatically...
    npm install
    echo.
    echo Trying to start again...
    npm start
)

pause
