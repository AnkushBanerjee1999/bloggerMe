import type { Server } from 'socket.io';
import type { AppNotification } from './types.js';

let ioInstance: Server | null = null;

export function setSocketIO(io: Server): void {
  ioInstance = io;
}

export function getSocketIO(): Server | null {
  return ioInstance;
}

/**
 * Emit a real-time notification to a specific user's private room: user:{userId}
 */
export function emitToUser(userId: string, notification: Omit<AppNotification, 'id' | 'createdAt'>): void {
  if (!ioInstance) {
    return;
  }

  const payload: AppNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  ioInstance.to(`user:${userId}`).emit('notification', payload);
}
