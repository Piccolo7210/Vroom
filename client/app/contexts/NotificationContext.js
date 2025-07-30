'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import SocketService from '@/app/lib/socketService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Set up socket listeners for notifications
    const setupNotificationListeners = () => {
      // Ride-related notifications
      SocketService.on('rideRequest', (data) => {
        addNotification({
          type: 'ride',
          title: 'New Ride Request',
          message: `Ride request from ${data.pickup} to ${data.destination}`,
          data: data,
          timestamp: new Date()
        });
        toast.info('New ride request received!');
      });

      SocketService.on('rideAccepted', (data) => {
        addNotification({
          type: 'ride',
          title: 'Ride Accepted',
          message: `Your ride has been accepted by ${data.driverName}`,
          data: data,
          timestamp: new Date()
        });
        toast.success('Your ride has been accepted!');
      });

      SocketService.on('rideStarted', (data) => {
        addNotification({
          type: 'ride',
          title: 'Ride Started',
          message: 'Your ride has started. Enjoy your trip!',
          data: data,
          timestamp: new Date()
        });
        toast.info('Your ride has started!');
      });

      SocketService.on('rideCompleted', (data) => {
        addNotification({
          type: 'ride',
          title: 'Ride Completed',
          message: `Your ride has been completed. Fare: ৳${data.fare}`,
          data: data,
          timestamp: new Date()
        });
        toast.success('Ride completed successfully!');
      });

      SocketService.on('rideCancelled', (data) => {
        addNotification({
          type: 'ride',
          title: 'Ride Cancelled',
          message: `Your ride has been cancelled. Reason: ${data.reason}`,
          data: data,
          timestamp: new Date()
        });
        toast.warning('Your ride has been cancelled');
      });

      // Driver location updates (silent notifications)
      SocketService.on('driverLocationUpdate', (data) => {
        // Don't create notification for location updates, just handle silently
        console.log('Driver location updated:', data);
      });

      // Payment notifications
      SocketService.on('paymentCompleted', (data) => {
        addNotification({
          type: 'payment',
          title: 'Payment Processed',
          message: `Payment of ৳${data.amount} has been processed`,
          data: data,
          timestamp: new Date()
        });
        toast.success('Payment completed!');
      });

      // System notifications
      SocketService.on('systemNotification', (data) => {
        addNotification({
          type: 'system',
          title: data.title || 'System Notification',
          message: data.message,
          data: data,
          timestamp: new Date()
        });
        
        // Show appropriate toast based on type
        switch (data.type) {
          case 'info':
            toast.info(data.message);
            break;
          case 'warning':
            toast.warning(data.message);
            break;
          case 'error':
            toast.error(data.message);
            break;
          default:
            toast(data.message);
        }
      });
    };

    setupNotificationListeners();

    return () => {
      // Clean up listeners when component unmounts
      SocketService.off('rideRequest');
      SocketService.off('rideAccepted');
      SocketService.off('rideStarted');
      SocketService.off('rideCompleted');
      SocketService.off('rideCancelled');
      SocketService.off('driverLocationUpdate');
      SocketService.off('paymentCompleted');
      SocketService.off('systemNotification');
    };
  }, []);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only last 50
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.read);
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    getUnreadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
