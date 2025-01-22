#!/bin/bash

# Kill any process running on port 3000
echo "Checking for processes on port 3000..."
PORT_PID=$(lsof -ti:3000)
if [ ! -z "$PORT_PID" ]; then
    echo "Killing process $PORT_PID on port 3000..."
    kill -9 $PORT_PID
fi

# Start the server
echo "Starting server..."
node src/server.js &
SERVER_PID=$!

# Wait for the server to start
echo "Waiting for server to start..."
sleep 2

# Open Chrome (Mac-specific)
echo "Opening Chrome..."
open -a "Google Chrome" "http://localhost:3000"

# Print instructions
echo "Server running on http://localhost:3000"
echo "Server PID: $SERVER_PID"
echo "To stop the server, run: kill -9 $SERVER_PID"
