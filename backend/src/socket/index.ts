import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { config } from '../config/index.js';
import { socketAuth } from './socketAuth.js';
import { registerSocketHandlers } from './socketHandlers.js';
import { setSocketIO, emitToUser } from './notificationEmitter.js';

export function initSocketIO(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Attach JWT authentication middleware
  io.use(socketAuth);

  // Register room management and event listeners
  registerSocketHandlers(io);

  // Store singleton reference for notificationEmitter
  setSocketIO(io);

  return io;
}

export { emitToUser };
export * from './types.js';
