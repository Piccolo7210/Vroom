#!/bin/bash

# Development startup script for vCopy app
# This script starts both the client and server with proper configuration

echo "🚀 Starting vCopy Development Environment"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo -e "${BLUE}📍 Local IP detected: ${LOCAL_IP}${NC}"

# Start the backend server
echo -e "${YELLOW}📡 Starting Backend Server...${NC}"
cd /home/toha/Desktop/Semester-6/vCopy/server
npm start &
SERVER_PID=$!
echo -e "${GREEN}✅ Backend server started (PID: ${SERVER_PID})${NC}"

# Wait a moment for server to start
sleep 3

# Start the frontend client
echo -e "${YELLOW}🌐 Starting Frontend Client...${NC}"
cd /home/toha/Desktop/Semester-6/vCopy/client

# Check if Chrome is available and suggest the geolocation fix
if command -v google-chrome &> /dev/null; then
    echo -e "${BLUE}🌍 Chrome detected. For geolocation to work on IP addresses:${NC}"
    echo -e "${YELLOW}Run Chrome with: google-chrome --unsafely-treat-insecure-origin-as-secure=http://${LOCAL_IP}:3000 --user-data-dir=/tmp/chrome_dev_test${NC}"
    echo ""
fi

# Start Next.js dev server
npm run dev &
CLIENT_PID=$!
echo -e "${GREEN}✅ Frontend client started (PID: ${CLIENT_PID})${NC}"

echo ""
echo -e "${GREEN}🎉 vCopy is running!${NC}"
echo -e "${BLUE}📱 Frontend: http://${LOCAL_IP}:3000${NC}"
echo -e "${BLUE}🔧 Backend: http://${LOCAL_IP}:5000${NC}"
echo ""
echo -e "${YELLOW}💡 For geolocation on IP addresses:${NC}"
echo -e "   • Chrome: Use the --unsafely-treat-insecure-origin-as-secure flag"
echo -e "   • Firefox: Set geo.security.allowinsecure=true in about:config"
echo ""
echo -e "${RED}⚠️  Press Ctrl+C to stop both servers${NC}"

# Wait for processes and clean up on exit
trap "echo -e '${RED}🛑 Stopping servers...${NC}'; kill $SERVER_PID $CLIENT_PID; exit" INT

wait
