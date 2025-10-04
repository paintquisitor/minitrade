#!/bin/bash
PORT=${1:-3001}
PID=$(lsof -ti tcp:$PORT)
if [ -n "$PID" ]; then
  echo "Ubijam proces na porcie $PORT (PID: $PID)..."
  kill -9 $PID
else
  echo "Port $PORT jest wolny."
fi
