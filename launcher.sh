#!/bin/bash
# GradeABeef Launcher
# Starts the dev server and opens the app in your browser

PROJECT_DIR="/Users/mmalot/Desktop/GradeABeef"
PORT=3000
export PATH="/opt/homebrew/bin:$PATH"

# Check if already running
if lsof -i :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
  open "http://localhost:$PORT"
  exit 0
fi

# Start the server in the background
cd "$PROJECT_DIR"
npm run dev &
SERVER_PID=$!

# Wait for server to be ready
echo "Starting GradeABeef..."
for i in $(seq 1 30); do
  if curl -s "http://localhost:$PORT" >/dev/null 2>&1; then
    open "http://localhost:$PORT"
    echo "GradeABeef is running at http://localhost:$PORT"
    wait $SERVER_PID
    exit 0
  fi
  sleep 1
done

echo "Server failed to start"
exit 1
