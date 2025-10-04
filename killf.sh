#!/bin/bash
# kill-front.sh — zabija proces nasłuchujący na podanym porcie (domyślnie 5173)

PORT=${1:-5173}

PID=$(lsof -t -i:$PORT)

if [ -n "$PID" ]; then
  echo "Zabijam proces PID $PID na porcie $PORT..."
  kill -9 $PID
  echo "Proces ubity."
else
  echo "Brak procesu na porcie $PORT."
fi