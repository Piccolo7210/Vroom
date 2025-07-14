#!/bin/bash

# Frontend Demo Test Script
# This script demonstrates the complete frontend functionality

echo "🚀 Vroom Ride-Sharing Platform - Frontend Demo"
echo "==============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the client directory"
    exit 1
fi

# Start the development server
echo "🌐 Starting Next.js Development Server..."
echo "This will start the frontend application on http://localhost:3000"
echo ""

echo "📋 Demo Flow Instructions:"
echo "========================="
echo ""
echo "1. 👤 CUSTOMER DEMO:"
echo "   - Navigate to http://localhost:3000/login"
echo "   - Login as a customer or create new account"
echo "   - Access customer dashboard at /dashboard/customer/[username]"
echo "   - Test features:"
echo "     ✓ Book Ride - Complete booking with fare estimates"
echo "     ✓ Track Ride - Real-time tracking with maps"
echo "     ✓ Ride History - View past rides with details"
echo "     ✓ Profile - Edit customer information"
echo ""
echo "2. 🚗 DRIVER DEMO:"
echo "   - Navigate to http://localhost:3000/login"
echo "   - Login as a driver or create new account"
echo "   - Access driver dashboard at /dashboard/driver/[username]"
echo "   - Test features:"
echo "     ✓ Available Rides - View and accept ride requests"
echo "     ✓ Active Ride - Manage current ride with OTP"
echo "     ✓ Earnings - View earnings dashboard"
echo "     ✓ Profile - Edit driver and vehicle info"
echo ""
echo "3. 🔄 REAL-TIME FEATURES:"
echo "   - Open both customer and driver dashboards"
echo "   - Book a ride as customer"
echo "   - Accept ride as driver"
echo "   - Watch real-time updates on both sides"
echo "   - Test location tracking and status updates"
echo ""
echo "4. 🗺️ MAPS INTEGRATION:"
echo "   - Use the ride tracking feature"
echo "   - Watch live map updates with markers"
echo "   - Test pickup and destination display"
echo "   - Verify driver location tracking"
echo ""

# Check if backend is running
echo "🔧 Prerequisites Check:"
echo "====================="
echo ""

# Check if backend is accessible
if curl -s http://localhost:5000/health >/dev/null 2>&1; then
    echo "✅ Backend server is running on port 5000"
else
    echo "⚠️  Backend server not detected on port 5000"
    echo "   Please start the backend server first:"
    echo "   cd ../server && npm start"
    echo ""
fi

# Check dependencies
if [ -d "node_modules" ]; then
    echo "✅ Node modules installed"
else
    echo "⚠️  Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting development server..."
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev
