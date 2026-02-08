#!/bin/bash

echo "========================================"
echo "  Ukrainian & Russian Typing Game"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Install with: brew install node"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed!"
    echo "Install with: brew install python"
    exit 1
fi

echo "[1/4] Checking Node.js dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install Node.js dependencies"
        exit 1
    fi
    echo "Node.js dependencies installed successfully!"
else
    echo "Node.js dependencies already installed."
fi
echo ""

echo "[2/4] Checking Python TTS dependencies..."
if ! python3 -c "import ukrainian_tts" &> /dev/null; then
    echo "Installing Python TTS library..."
    cd tts-repo
    pip3 install -e . 2>/dev/null
    cd ..

    if ! python3 -c "import ukrainian_tts" &> /dev/null; then
        echo "[WARNING] Ukrainian TTS library not fully installed."
        echo "Attempting to install dependencies..."
        pip3 install flask flask-cors torch espnet typeguard
    fi
else
    echo "Python TTS library already installed."
fi

# Check Flask
if ! python3 -c "import flask" &> /dev/null; then
    echo "Installing Flask..."
    pip3 install flask flask-cors
fi
echo ""

echo "[3/4] Starting Python TTS Server..."
echo "Starting on http://localhost:3002"
python3 tts-server.py &
TTS_PID=$!

sleep 3
echo ""

echo "[4/4] Starting Vite Development Server..."
echo "Starting on http://localhost:5173"
npm run dev &
VITE_PID=$!

sleep 5
echo ""

echo ""
echo "========================================"
echo "  Application Started Successfully!"
echo "========================================"
echo ""
echo "  Web App:     http://localhost:5173"
echo "  TTS Server:  http://localhost:3002"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo "========================================"
echo ""

# Trap Ctrl+C to kill both background processes
trap "echo ''; echo 'Shutting down...'; kill $TTS_PID $VITE_PID 2>/dev/null; exit 0" INT TERM

# Wait for either process to exit
wait
