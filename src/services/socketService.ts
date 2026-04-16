import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './axiosBaseQuery';

const SOCKET_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL
    ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/api\/?$/, '')
    : 'http://localhost:3000'
);

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    this.socket = io(`${SOCKET_BASE_URL}/chat`, {
      auth: { token },
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
      console.error('Socket connection error:', error.message);
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
  onMessage(callback: (data: any) => void): void {
    this.socket?.on('message:receive', callback);
  }

  onMessageSent(callback: (data: any) => void): void {
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

  onFriendRequest(callback: (data: any) => void): void {
    this.socket?.on('friend:request', callback);
  }

  onFriendAccepted(callback: (data: any) => void): void {
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
