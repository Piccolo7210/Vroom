'use client';

import { useState } from 'react';
import { FaMapMarkerAlt, FaSearch, FaCar, FaClock } from 'react-icons/fa';

const BookRide = ({ userName }) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearchRide = (e) => {
    e.preventDefault();
    setSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      setSearching(false);
    }, 2000);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
        Book a Ride
      </h2>
      
      <div className="bg-blue-50/50 rounded-xl p-6 mb-8">
        <form onSubmit={handleSearchRide} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-5 w-5 text-blue-500" />
              </div>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white/80 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter pickup location"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-5 w-5 text-red-500" />
              </div>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white/80 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter destination"
                required
              />
            </div>
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={searching || !pickup || !destination}
              className="w-full py-3 px-4 border border-transparent rounded-md shadow-lg
              bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-medium
              hover:from-blue-700 hover:to-indigo-600 focus:outline-none focus:ring-2
              focus:ring-offset-2 focus:ring-blue-500 transition-all transform
              hover:scale-[1.02] disabled:opacity-70"
            >
              {searching ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching for rides...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FaSearch className="mr-2" />
                  Find Rides
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/60">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FaClock className="mr-2 text-blue-500" />
          Recent Rides
        </h3>
        <div className="text-gray-600">
          <p className="text-center py-8">No recent rides to display.</p>
        </div>
      </div>
    </div>
  );
};

export default BookRide;