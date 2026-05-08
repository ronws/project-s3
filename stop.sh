#!/bin/bash
# stop.sh - Stop all Project S3 services

# Colors
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Stopping Project S3 services..."

# Kill processes by port (more reliable than PIDs)
echo "  Stopping backend (port 4443)..."
kill $(lsof -t -i:4443) 2>/dev/null || true

echo "  Stopping frontend (port 8080)..."
kill $(lsof -t -i:8080) 2>/dev/null || true

# Also kill any node/python processes in our directories (backup method)
pkill -f "node src/server.js" 2>/dev/null || true
pkill -f "http.server 8080" 2>/dev/null || true

echo -e "${RED}✓ All services stopped${NC}"
