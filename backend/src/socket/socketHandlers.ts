import type { Server } from 'socket.io';
import type { AuthenticatedSocket } from './types.js';

export function registerSocketHandlers(io: Server): void {
  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = socket.user;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    const roomName = `user:${user.userId}`;
    socket.join(roomName);

    socket.on('disconnect', (_reason) => {
      socket.leave(roomName);
    });
  });
}
