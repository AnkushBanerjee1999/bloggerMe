import { io, Socket } from 'socket.io-client';
import { tokenStorage } from '@/utils/api';

let socket: Socket | null = null;

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(): Socket | null {
  const token = tokenStorage.getAccessToken();
  if (!token) {
    disconnectSocket();
    return null;
  }

  // If socket already connected with active token, return it
  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    // Connected to private user room
  });

  socket.on('connect_error', (_err) => {
    // Gracefully handle connection error without crashing UI
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
