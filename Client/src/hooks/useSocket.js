import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

// In development, Vite proxy forwards /socket.io to localhost:5000
// In production, set VITE_API_URL to the backend URL
const SOCKET_URL = import.meta.env.VITE_API_URL || '';

/**
 * Hook for real-time Socket.io connection.
 * Joins the wallet room and listens for score:updated events.
 *
 * @param {string|null} walletAddress - The connected wallet address
 * @param {function} onScoreUpdate - Callback when score is updated in real-time
 */
export function useSocket(walletAddress, onScoreUpdate) {
  const socketRef = useRef(null);

  useEffect(() => {
    // Only connect if we have a wallet address
    if (!walletAddress) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.io] Connected:', socket.id);
      // Join the wallet-specific room for personalised events
      socket.emit('join:wallet', walletAddress);
    });

    socket.on('score:updated', (data) => {
      console.log('[Socket.io] Score updated:', data);
      if (onScoreUpdate && data) {
        onScoreUpdate(data);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.io] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.io] Connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [walletAddress, onScoreUpdate]);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return { emit };
}
