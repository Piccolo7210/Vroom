#!/bin/bash

# Map Integration Demo Script
# Showcases the new map-based location selection features

echo "🗺️  MAP INTEGRATION DEMO - Vroom Ride Sharing"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📍 NEW FEATURES IMPLEMENTED:${NC}"
echo "✅ Automatic current location detection"
echo "✅ Interactive map-based location selection"
echo "✅ Real-time address geocoding"
echo "✅ Custom pickup/destination markers"
echo "✅ Mobile-responsive map interface"
echo ""

echo -e "${YELLOW}🔧 CHECKING SYSTEM STATUS...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Not in client directory${NC}"
    echo "Please run this script from the client folder"
    exit 1
fi

echo -e "${GREEN}✅ Client directory confirmed${NC}"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}✅ Dependencies ready${NC}"

# Check if Leaflet is installed
if grep -q "react-leaflet" package.json; then
    echo -e "${GREEN}✅ Leaflet maps library installed${NC}"
else
    echo -e "${RED}❌ Leaflet not found${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 STARTING DEVELOPMENT SERVER...${NC}"
echo ""
echo "The following features are now available:"
echo ""
echo "📱 CUSTOMER DASHBOARD (/dashboard/customer/[userName]):"
echo "   • Book Ride with Map Selection"
echo "   • Automatic GPS location detection"
echo "   • Interactive map for pickup/destination"
echo "   • Real-time address lookup"
echo ""
echo "🗺️  MAP FEATURES:"
echo "   • Click anywhere on map to select location"
echo "   • Green markers for pickup points"
echo "   • Red markers for destinations"
echo "   • Current location detection button"
echo "   • Professional modal interface"
echo ""
echo "📍 LOCATION DETECTION:"
echo "   • Automatic current location on page load"
echo "   • GPS-level accuracy when available"
echo "   • Fallback to manual selection"
echo "   • Real-time address resolution"
echo ""

# Start the development server
echo -e "${GREEN}🌐 Starting Next.js development server...${NC}"
echo ""
echo "Navigate to:"
echo "• http://localhost:3000 - Main application"
echo "• http://localhost:3000/dashboard/customer/testuser - Customer dashboard"
echo ""
echo -e "${YELLOW}💡 TIP: Allow location access when prompted to test GPS features${NC}"
echo ""

npm run dev
