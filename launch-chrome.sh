#!/bin/bash

# Quick Chrome launcher for vCopy development
# This script launches Chrome with geolocation enabled for IP addresses

# Get the local IP
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo "🌍 Launching Chrome with geolocation enabled for IP: $LOCAL_IP"
echo "🔧 Using --unsafely-treat-insecure-origin-as-secure flag"

# Close any existing Chrome instances (optional)
# pkill chrome

# Launch Chrome with the required flags
google-chrome \
  --unsafely-treat-insecure-origin-as-secure=http://$LOCAL_IP:3000 \
  --user-data-dir=/tmp/chrome_vcopy_dev \
  --disable-web-security \
  --allow-running-insecure-content \
  http://$LOCAL_IP:3000/

echo "✅ Chrome launched with geolocation support for IP addresses"
echo "📱 Navigate to your vCopy app and test location access"
