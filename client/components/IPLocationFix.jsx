'use client';

import { useState, useEffect } from 'react';
import { FaChrome, FaFirefox, FaExclamationTriangle, FaCopy, FaCheck } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const IPLocationFix = ({ isOpen, onClose }) => {
  const [browserInfo, setBrowserInfo] = useState({});
  const [copiedCommand, setCopiedCommand] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    const isEdge = /Edg/.test(userAgent);
    const currentUrl = window.location.href;
    const ipMatch = currentUrl.match(/http:\/\/(\d+\.\d+\.\d+\.\d+:\d+)/);
    const ipAddress = ipMatch ? ipMatch[1] : '192.168.0.104:3000';

    setBrowserInfo({
      isChrome,
      isFirefox,
      isEdge,
      currentUrl,
      ipAddress,
      userAgent
    });
  }, []);

  const chromeCommand = `google-chrome --unsafely-treat-insecure-origin-as-secure=http://${browserInfo.ipAddress} --user-data-dir=/tmp/chrome_dev_test`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <FaExclamationTriangle className="text-orange-500 text-2xl mr-3" />
            <h2 className="text-xl font-bold">Location Access Fix for IP Addresses</h2>
          </div>

          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-orange-800">
              <strong>Issue:</strong> Browsers block geolocation on HTTP IP addresses for security reasons.
              Since you're using <code className="bg-orange-100 px-1 rounded">{browserInfo.currentUrl}</code> for socket communication,
              you need to explicitly allow geolocation for this IP address.
            </p>
          </div>

          {browserInfo.isChrome && (
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <FaChrome className="text-blue-500 text-xl mr-2" />
                <h3 className="text-lg font-semibold">Chrome Solution</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Method 1: Command Line Flag (Recommended)</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Close all Chrome windows and restart Chrome with this command:
                  </p>
                  <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm border relative">
                    <code>{chromeCommand}</code>
                    <Button
                      onClick={() => copyToClipboard(chromeCommand)}
                      size="sm"
                      variant="outline"
                      className="absolute right-2 top-2 p-1"
                    >
                      {copiedCommand ? <FaCheck className="text-green-500" /> : <FaCopy />}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Method 2: Chrome Flags</h4>
                  <ol className="text-sm space-y-1 ml-4">
                    <li>1. Go to <code className="bg-gray-100 px-1 rounded">chrome://flags</code></li>
                    <li>2. Search for "Insecure origins treated as secure"</li>
                    <li>3. Add <code className="bg-gray-100 px-1 rounded">http://{browserInfo.ipAddress}</code> to the list</li>
                    <li>4. Restart Chrome</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {browserInfo.isFirefox && (
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <FaFirefox className="text-orange-500 text-xl mr-2" />
                <h3 className="text-lg font-semibold">Firefox Solution</h3>
              </div>
              
              <ol className="text-sm space-y-1 ml-4">
                <li>1. Go to <code className="bg-gray-100 px-1 rounded">about:config</code></li>
                <li>2. Accept the warning message</li>
                <li>3. Search for <code className="bg-gray-100 px-1 rounded">geo.security.allowinsecure</code></li>
                <li>4. Set it to <code className="bg-gray-100 px-1 rounded">true</code></li>
                <li>5. Restart Firefox</li>
              </ol>
            </div>
          )}

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Alternative: Use Domain Name</h4>
            <p className="text-blue-700 text-sm">
              You can also add an entry to your <code>/etc/hosts</code> file:
            </p>
            <code className="block bg-blue-100 p-2 rounded mt-2 text-sm">
              {browserInfo.ipAddress?.split(':')[0]} vcopy.local
            </code>
            <p className="text-blue-700 text-sm mt-1">
              Then access your app via <code>http://vcopy.local:3000</code>
            </p>
          </div>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">For Production</h4>
            <p className="text-yellow-700 text-sm">
              • Use HTTPS with a valid SSL certificate<br/>
              • Use a proper domain name instead of IP addresses<br/>
              • Consider using a reverse proxy like nginx
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              I'll Fix This Later
            </Button>
            <Button onClick={onClose} className="flex-1">
              Done - Let Me Test
            </Button>
          </div>

          <div className="mt-4 text-xs text-gray-500 p-3 bg-gray-50 rounded">
            <strong>Debug Info:</strong><br/>
            User Agent: {browserInfo.userAgent}<br/>
            Current URL: {browserInfo.currentUrl}<br/>
            Detected IP: {browserInfo.ipAddress}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IPLocationFix;
