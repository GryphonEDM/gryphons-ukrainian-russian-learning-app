@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Ukrainian & Russian Typing Game
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed!
    echo Please install Python from https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo [1/4] Checking Node.js dependencies...
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install Node.js dependencies
        pause
        exit /b 1
    )
    echo Node.js dependencies installed successfully!
) else (
    echo Node.js dependencies already installed.
)
echo.

echo [2/4] Checking Python TTS dependencies...
python -c "import ukrainian_tts" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing Python TTS library...
    cd tts-repo
    pip install -e . >nul 2>nul
    cd ..

    python -c "import ukrainian_tts" >nul 2>nul
    if %ERRORLEVEL% neq 0 (
        echo [WARNING] Ukrainian TTS library not fully installed.
        echo Attempting to install dependencies...
        pip install flask flask-cors torch espnet typeguard
    )
) else (
    echo Python TTS library already installed.
)

:: Check Flask
python -c "import flask" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing Flask...
    pip install flask flask-cors
)
echo.

echo [3/4] Starting Python TTS Server...
echo Starting on http://localhost:3002
start "Ukrainian TTS Server" cmd /k "python tts-server.py"

:: Wait for TTS server to start
echo Waiting for TTS server to initialize...
timeout /t 3 /nobreak >nul
echo.

echo [4/4] Starting Vite Development Server...
echo Starting on http://localhost:5173
start "Vite Dev Server" cmd /k "npm run dev"

:: Wait for Vite server to start
echo Waiting for Vite server to initialize...
timeout /t 5 /nobreak >nul
echo.

echo.
echo ========================================
echo   Application Started Successfully!
echo ========================================
echo.
echo   Web App:     http://localhost:5173
echo   TTS Server:  http://localhost:3002
echo.
echo   Two command windows have been opened:
echo   - Ukrainian TTS Server
echo   - Vite Dev Server
echo.
echo   Close those windows to stop the servers.
echo   This window can be closed now.
echo ========================================
echo.
pause
