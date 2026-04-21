import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, getAccessToken } from './axiosBaseQuery';

const toOrigin = (rawUrl: string): string | null => {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed).origin;
  } catch {
    console.error(
      `[Config] VITE_SOCKET_URL must be a valid absolute URL. Received: "${rawUrl}"`,
    );
    return null;
  }
};

const getOptionalEnv = (name: string): string | null => {
  const value = import.meta.env?.[name];
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }
  return value.trim();
};

const normalizeSocketPath = (value: string): string => {
  const trimmed = value.trim();
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const inferSocketPathFromApiBaseUrl = (apiBaseUrl: string): string => {
  try {
    const apiPathname = new URL(apiBaseUrl).pathname.replace(/\/+$/, '');
    if (apiPathname.endsWith('/api')) {
      return `${apiPathname.slice(0, -4)}/socket.io`;
    }
  } catch {
    console.warn('[Config] Could not infer socket path from VITE_API_BASE_URL, using /socket.io');
  }

  return '/socket.io';
};

const SOCKET_SERVER_URL =
  toOrigin(getOptionalEnv('VITE_SOCKET_URL') || API_BASE_URL) ||
  toOrigin(API_BASE_URL) ||
  window.location.origin;
const SOCKET_NAMESPACE = '/chat';
const SOCKET_PATH = normalizeSocketPath(
  getOptionalEnv('VITE_SOCKET_PATH') || inferSocketPathFromApiBaseUrl(API_BASE_URL),
);

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket | null {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = getAccessToken();
    if (!token) {
      return null;
    }

    this.socket = io(`${SOCKET_SERVER_URL}${SOCKET_NAMESPACE}`, {
      auth: { token },
      path: SOCKET_PATH,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', {
        message: error.message,
        serverUrl: SOCKET_SERVER_URL,
        namespace: SOCKET_NAMESPACE,
        path: SOCKET_PATH,
      });
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Chat events
  sendMessage(receiverId: string, content: string, type = 'text'): void {
    this.socket?.emit('message:send', { receiverId, content, type });
  }

  markAsRead(senderId: string): void {
    this.socket?.emit('message:read', { senderId });
  }

  startTyping(receiverId: string): void {
    this.socket?.emit('typing:start', { receiverId });
  }

  stopTyping(receiverId: string): void {
    this.socket?.emit('typing:stop', { receiverId });
  }

  checkOnlineStatus(userIds: string[]): void {
    this.socket?.emit('online:check', { userIds });
  }

  // Event listeners
  onMessage(callback: (data: unknown) => void): void {
    this.socket?.on('message:receive', callback);
  }

  onMessageSent(callback: (data: unknown) => void): void {
    this.socket?.on('message:sent', callback);
  }

  onMessageRead(callback: (data: { readBy: string }) => void): void {
    this.socket?.on('message:read', callback);
  }

  onTypingStart(callback: (data: { userId: string }) => void): void {
    this.socket?.on('typing:start', callback);
  }

  onTypingStop(callback: (data: { userId: string }) => void): void {
    this.socket?.on('typing:stop', callback);
  }

  onUserOnline(callback: (data: { userId: string }) => void): void {
    this.socket?.on('user:online', callback);
  }

  onUserOffline(callback: (data: { userId: string }) => void): void {
    this.socket?.on('user:offline', callback);
  }

  onOnlineStatus(
    callback: (data: { userId: string; isOnline: boolean }[]) => void,
  ): void {
    this.socket?.on('online:status', callback);
  }

  onFriendRequest(callback: (data: unknown) => void): void {
    this.socket?.on('friend:request', callback);
  }

  onFriendAccepted(callback: (data: unknown) => void): void {
    this.socket?.on('friend:accepted', callback);
  }

  // Remove listeners
  offMessage(): void {
    this.socket?.off('message:receive');
  }

  offMessageSent(): void {
    this.socket?.off('message:sent');
  }

  offAll(): void {
    this.socket?.removeAllListeners();
  }
}

export const socketService = new SocketService();
export default socketService;
