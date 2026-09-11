#!/bin/bash
cd "$(dirname "$0")"

echo "========================================="
echo "Starting GNPS Exam Architect Server..."
echo "Press Ctrl+C to stop the server."
echo "========================================="

# Open default browser
(sleep 1 && (open http://localhost:8000 2>/dev/null || xdg-open http://localhost:8000 2>/dev/null)) &

# Run python server
python3 server.py
