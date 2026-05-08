#!/bin/bash
# start.sh - Start both backend and frontend for Project S3

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Project S3 - Gemini Flash API${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Warning: backend/.env not found!${NC}"
    echo "Copying from .env.example..."
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}Please edit backend/.env and add your GOOGLE_API_KEY${NC}"
    exit 1
fi

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo -e "${GREEN}Starting Backend (Express API)...${NC}"
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "  Backend PID: $BACKEND_PID"
echo "  Log: logs/backend.log"

# Wait for backend to start
sleep 2

# Create logs directory if not exists
mkdir -p logs

# Start Frontend
echo -e "${GREEN}Starting Frontend (Web UI)...${NC}"
cd frontend
python3 -m http.server 8080 > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "  Frontend PID: $FRONTEND_PID"
echo "  Log: logs/frontend.log"

echo ""
echo -e "${GREEN}✓ Both services started!${NC}"
echo ""
echo "  Backend API:  http://localhost:4443"
echo "  Frontend UI:  http://localhost:8080"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for user to Ctrl+C
wait
