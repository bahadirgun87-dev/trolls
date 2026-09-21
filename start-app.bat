@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo Voice App Launcher
echo ============================================
echo.

REM Get the directory of this batch file
set "SCRIPT_DIR=%~dp0"
echo Batch file location: %SCRIPT_DIR%
echo.

REM Change to the script directory
cd /d "%SCRIPT_DIR%"
echo Current directory: %CD%
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found in current directory!
    echo Please make sure this batch file is in the voice-app folder.
    pause
    exit /b 1
)

echo Found package.json - we are in the right directory.
echo.

REM Check and install dependencies
echo Checking dependencies...
echo.

if not exist "node_modules" (
    echo Installing main dependencies...
    call npm install
    if !errorlevel! neq 0 (
        echo ERROR: Failed to install main dependencies
        pause
        exit /b 1
    )
)

if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client
    call npm install
    if !errorlevel! neq 0 (
        echo ERROR: Failed to install client dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
)

if not exist "signaling-server\node_modules" (
    echo Installing signaling server dependencies...
    cd signaling-server
    call npm install
    if !errorlevel! neq 0 (
        echo ERROR: Failed to install signaling server dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
)

echo.
echo All dependencies are installed.
echo.

REM Start signaling server
echo Starting signaling server...
cd signaling-server
if not exist "server.js" (
    echo ERROR: server.js not found in signaling-server directory!
    cd ..
    pause
    exit /b 1
)
start "Voice App - Signaling Server" cmd /k "node server.js"
cd ..

echo Waiting for server to initialize...
timeout /t 3 /nobreak > nul
echo.

REM Start the main application
echo Starting Electron application...
echo.
set ELECTRON_START_URL=http://localhost:3000
call npm run dev

echo.
echo Application closed.
pause
