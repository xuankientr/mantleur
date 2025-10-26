import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const SocketContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated, updateUser } = useAuth();
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    // Prevent multiple socket connections
    if (socketRef.current) {
      console.log('Socket already exists, skipping creation');
      return;
    }

    console.log('Creating new socket connection...');
    
    // Tạo socket connection với stable config
    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 3,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      forceNew: false,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      // Clear any pending reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      
      // Only attempt reconnection for certain reasons
      if (reason === 'io server disconnect' || reason === 'transport close') {
        // Server initiated disconnect or transport close, don't reconnect
        console.log('Not attempting reconnection due to:', reason);
        return;
      }
      
      // Client initiated disconnect, attempt reconnection after delay
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (newSocket.disconnected) {
          console.log('Attempting to reconnect...');
          newSocket.connect();
        }
      }, 5000); // Increased delay to 5 seconds
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Cleanup khi component unmount
    return () => {
      console.log('Cleaning up socket connection...');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (newSocket) {
        newSocket.removeAllListeners();
        newSocket.close();
      }
      socketRef.current = null;
    };
  }, []); // Empty dependency array to create only once

  // Separate effect for user registration
  useEffect(() => {
    if (socket && isAuthenticated && user?.id) {
      console.log('Registering user for notifications:', user.id);
      socket.emit('register-user', user.id);
    }
  }, [socket, isAuthenticated, user?.id]);

  // Listen for donation-related realtime updates for the authenticated user
  useEffect(() => {
    if (!socket || !isAuthenticated || !user?.id) return;

    const handleBalanceUpdate = (payload) => {
      try {
        if (payload?.userId && payload?.balance !== undefined && payload.userId === user.id) {
          updateUser({ coinBalance: payload.balance });
        }
      } catch (e) {
        console.error('Error handling coin-balance-update:', e);
      }
    };

    const handleNotification = (payload) => {
      try {
        // UI surfaces handle pretty notifications (e.g., toasts) in Layout
        // Keep this as a pass-through listener to ensure event delivery
        console.log('Notification received:', payload);
      } catch (e) {
        console.error('Error handling notification:', e);
      }
    };

    socket.on('coin-balance-update', handleBalanceUpdate);
    socket.on('notification', handleNotification);

    return () => {
      socket.off('coin-balance-update', handleBalanceUpdate);
      socket.off('notification', handleNotification);
    };
  }, [socket, isAuthenticated, user?.id, updateUser]);

  const value = {
    socket,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};




















