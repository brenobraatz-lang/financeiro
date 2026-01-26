import { io, Socket } from 'socket.io-client';
import { Despesa, EntradaCaixa } from '../types/Despesa';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket?.connected) return this.socket;

    const serverUrl = `http://${window.location.hostname}:3001`;
    
    this.socket = io(serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Conectado ao servidor WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado do servidor WebSocket');
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔥 Erro de conexão WebSocket:', error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
    this.socket = null;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Despesas events
  onDespesaCreated(callback: (despesa: Despesa) => void): void {
    if (this.socket) {
      this.socket.on('despesa:created', callback);
    }
  }

  onDespesaUpdated(callback: (despesa: Despesa) => void): void {
    if (this.socket) {
      this.socket.on('despesa:updated', callback);
    }
  }

  onDespesaDeleted(callback: (id: number) => void): void {
    if (this.socket) {
      this.socket.on('despesa:deleted', callback);
    }
  }

  // Caixa events
  onEntradaCreated(callback: (entrada: EntradaCaixa) => void): void {
    if (this.socket) {
      this.socket.on('entrada:created', callback);
    }
  }

  onEntradaUpdated(callback: (entrada: EntradaCaixa) => void): void {
    if (this.socket) {
      this.socket.on('entrada:updated', callback);
    }
  }

  onEntradaDeleted(callback: (id: number) => void): void {
    if (this.socket) {
      this.socket.on('entrada:deleted', callback);
    }
  }
}

// Export singleton
export const socketService = new SocketService();

// Backward compatibility
export const connectSocket = (): Socket => socketService.connect();
export const getSocket = (): Socket | null => socketService.getSocket();
export const disconnectSocket = (): void => socketService.disconnect();
