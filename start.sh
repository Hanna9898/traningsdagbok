#!/bin/bash
cd "$(dirname "$0")"
PORT=3737

# Stoppa gammal server på samma port
lsof -tiTCP:$PORT -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null
sleep 0.3

echo "Startar Träningsdagbok på http://localhost:$PORT"
python3 serve.py &
sleep 0.5
open "http://localhost:$PORT/?$(date +%s)"
wait
