'use client';

import { useState } from 'react';
import { FaMapMarkerAlt, FaInfoCircle, FaTimes, FaChrome, FaFirefox, FaSafari, FaEdge } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const LocationGuide = ({ isOpen, onClose, onRetry }) => {
  const [activeTab, setActiveTab] = useState('chrome');

  if (!isOpen) return null;

  const browserGuides = {
    chrome: {
      icon: FaChrome,
      name: 'Chrome',
      steps: [
        'Look for the location icon 📍 in the address bar (left side)',
        'Click on it and select "Always allow"',
        'Or click the lock icon 🔒 → Site settings → Location → Allow',
        'Refresh the page'
      ]
    },
    firefox: {
      icon: FaFirefox,
      name: 'Firefox',
      steps: [
        'Click the shield icon 🛡️ in the address bar',
        'Select "Allow location access"',
        'Or go to Settings → Privacy & Security → Permissions → Location',
        'Add this site to allowed locations'
      ]
    },
    safari: {
      icon: FaSafari,
      name: 'Safari',
      steps: [
        'Click Safari → Preferences → Websites',
        'Select "Location" from the left sidebar',
        'Find this website and change to "Allow"',
        'Refresh the page'
      ]
    },
    edge: {
      icon: FaEdge,
      name: 'Edge',
      steps: [
        'Click the location icon 📍 in the address bar',
        'Select "Always allow"',
        'Or click Settings → Site permissions → Location',
        'Add this site to allowed list'
      ]
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-blue-600 text-2xl mr-3" />
              <h2 className="text-xl font-bold">Enable Location Access</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              <FaTimes />
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <FaInfoCircle className="text-blue-600 mr-2 mt-1 flex-shrink-0" />
              <div className="text-blue-800">
                <p className="font-medium mb-1">Why do we need location access?</p>
                <p className="text-sm">
                  We use your location to find nearby ride requests and provide accurate pickup/drop-off services. 
                  Your location data is only used for ride matching and is not stored permanently.
                </p>
              </div>
            </div>
          </div>

          {/* Browser Selection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Select your browser:</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(browserGuides).map(([key, browser]) => {
                const IconComponent = browser.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                      activeTab === key
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="mr-2" />
                    {browser.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">
              Steps for {browserGuides[activeTab].name}:
            </h3>
            <div className="space-y-3">
              {browserGuides[activeTab].steps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Common Issues */}
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">Common Issues:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• If you don't see the location icon, try refreshing the page</li>
              <li>• Make sure your device's location services are enabled</li>
              <li>• Some browsers require HTTPS for location access</li>
              <li>• Clear browser cache if the setting doesn't take effect</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={onRetry} className="flex-1">
              <FaMapMarkerAlt className="mr-2" />
              Try Location Access Again
            </Button>
            <Button onClick={onClose} variant="outline">
              Continue Without Location
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Without location access, we'll use a default location (Dhaka) which may show fewer relevant rides.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LocationGuide;
