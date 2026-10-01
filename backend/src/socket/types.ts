import type { Socket } from 'socket.io';

export type NotificationType = 'NEW_COMMENT' | 'COMMENT_STATUS_CHANGED' | 'ROLE_CHANGED';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  createdAt: string;
}

export interface SocketUserPayload {
  userId: string;
  role: string;
}

export interface AuthenticatedSocket extends Socket {
  user?: SocketUserPayload;
}
