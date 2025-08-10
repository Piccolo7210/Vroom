'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaChartBar,
  FaMoneyBillWave,
  FaSpinner, 
  FaDownload,
  FaCalendarAlt,
  FaSearch,
  FaChartLine,
  FaChartPie
} from 'react-icons/fa';

const RevenueAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    lastMonthRevenue: 0,
    lastWeekRevenue: 0,
    today: 0,
    revenueByMonth: [],
    topDrivers: [],
    topAreas: []
  });
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchRevenueData();
  }, [dateFilter]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate
      }).toString();
      
      const response = await fetch(`/api/admin/revenue?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch revenue data');
      }

      const data = await response.json();
      setRevenueData(data);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error('Error loading revenue data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleExportData = () => {
    // This would typically generate a CSV or Excel file for download
    toast.info('Exporting revenue data... This feature will be implemented soon.');
  };

  // Calculate revenue trend percentage compared to previous period
  const calculateTrend = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    const percentage = ((current - previous) / previous) * 100;
    return percentage.toFixed(1);
  };

  // Mock data for charts - in real implementation, these would use data visualization libraries
  const renderMockBarChart = () => (
    <div className="h-64 mt-4 bg-gray-50 rounded-lg p-4 flex items-end justify-between space-x-2">
      {revenueData.revenueByMonth.map((month, i) => (
        <div key={i} className="flex flex-col items-center w-full">
          <div 
            className="w-full bg-gradient-to-t from-gray-700 to-gray-600 rounded-t-sm" 
            style={{ 
              height: `${(month.revenue / Math.max(...revenueData.revenueByMonth.map(m => m.revenue))) * 100}%`,
              minHeight: '10%'
            }}
          ></div>
          <div className="text-xs mt-2 text-gray-600">{month.month}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Revenue Analytics</h2>
        <button
          onClick={handleExportData}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FaDownload className="mr-2" />
          Export Data
        </button>
      </div>

      {/* Date filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-medium mb-3 md:mb-0">Filter by Date Range</h3>
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex items-center">
              <FaCalendarAlt className="text-gray-400 mr-2" />
              <input
                type="date"
                name="startDate"
                value={dateFilter.startDate}
                onChange={handleDateFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
            <div className="flex items-center">
              <span className="mx-2">to</span>
              <input
                type="date"
                name="endDate"
                value={dateFilter.endDate}
                onChange={handleDateFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <FaSpinner className="animate-spin text-4xl text-gray-700" />
        </div>
      ) : (
        <>
          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RevenueCard 
              title="Total Revenue" 
              value={formatCurrency(revenueData.totalRevenue)} 
              icon={<FaMoneyBillWave className="text-white" />} 
              color="from-blue-500 to-blue-700"
            />
            <RevenueCard 
              title="This Month" 
              value={formatCurrency(revenueData.lastMonthRevenue)} 
              icon={<FaChartBar className="text-white" />} 
              color="from-green-500 to-green-700"
              trend={calculateTrend(revenueData.lastMonthRevenue, revenueData.lastMonthRevenue * 0.8)}
            />
            <RevenueCard 
              title="This Week" 
              value={formatCurrency(revenueData.lastWeekRevenue)} 
              icon={<FaChartLine className="text-white" />} 
              color="from-purple-500 to-purple-700"
              trend={calculateTrend(revenueData.lastWeekRevenue, revenueData.lastWeekRevenue * 0.9)}
            />
            <RevenueCard 
              title="Today" 
              value={formatCurrency(revenueData.today)} 
              icon={<FaChartPie className="text-white" />} 
              color="from-orange-500 to-orange-700"
              trend={calculateTrend(revenueData.today, revenueData.today * 1.1)}
            />
          </div>

          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Revenue Trend</h3>
            {renderMockBarChart()}
            <div className="text-center mt-4 text-sm text-gray-500">
              Revenue data for the selected period
            </div>
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Top Earning Drivers</h3>
              {revenueData.topDrivers && revenueData.topDrivers.length > 0 ? (
                <div className="space-y-4">
                  {revenueData.topDrivers.map((driver, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          {driver.photo ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={driver.photo}
                              alt={driver.name}
                            />
                          ) : (
                            <span className="text-gray-500">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-sm text-gray-500">{driver.rides} rides</div>
                        </div>
                      </div>
                      <div className="font-semibold">{formatCurrency(driver.earnings)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No driver data available</div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Popular Areas</h3>
              {revenueData.topAreas && revenueData.topAreas.length > 0 ? (
                <div className="space-y-4">
                  {revenueData.topAreas.map((area, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{area.name}</div>
                          <div className="text-sm text-gray-500">{area.rides} rides</div>
                        </div>
                      </div>
                      <div className="font-semibold">{formatCurrency(area.revenue)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No area data available</div>
              )}
            </div>
          </div>

          {/* Payment Methods Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px] bg-gray-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">70%</div>
                  <div className="text-lg">Credit Card</div>
                </div>
              </div>
              <div className="flex-1 min-w-[200px] bg-gray-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">25%</div>
                  <div className="text-lg">Cash</div>
                </div>
              </div>
              <div className="flex-1 min-w-[200px] bg-gray-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">5%</div>
                  <div className="text-lg">Other</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const RevenueCard = ({ title, value, icon, color, trend }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className={`bg-gradient-to-r ${color} p-4 flex justify-between items-center`}>
        <h3 className="text-white font-medium">{title}</h3>
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="p-4">
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className={`flex items-center text-sm mt-2 ${parseFloat(trend) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {parseFloat(trend) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(trend))}%
            <span className="text-gray-500 ml-1">vs previous period</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueAnalytics;
