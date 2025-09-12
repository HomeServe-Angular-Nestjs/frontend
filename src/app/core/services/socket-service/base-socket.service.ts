import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../../../../environments/env';

export abstract class BaseSocketService {
    protected socket: Socket | null = null;
    protected readonly _socketUrl = SOCKET_URL;
    protected abstract namespace: string;

    connect(): void {
        if (this.socket && this.socket.connected) {
            return;
        }

        if (!this.socket) {
            this.socket = io(`${this._socketUrl}/${this.namespace}`, {
                withCredentials: true,
                transports: ['websocket'],
                forceNew: true,
            });

            this.socket.on('connect', () => {
                console.log('Connected to server with ID:', this.socket!.id);
                this.onConnect();
            });

            this.socket.on('disconnect', (reason: string) => {
                console.log('Disconnected from server:', reason);
                this.onDisconnect(reason);
            });

            // this.socket.onAny((event, ...args) => {
            //     console.log("📩 Event received:", event, args);
            // });
        }

        this.socket.connect();
        this.socket?.on('error', (error) => {
            console.error('Received socket error:', error);
            if (error.type === 'validation') {
                // Display in UI or handle accordingly
            }
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    protected abstract onConnect(): void;
    protected abstract onDisconnect(reason: string): void;

    emit<T>(event: string, data?: T): void {
        this.socket?.emit(event, data);
    }

    listen<T>(event: string, callback: (data: T) => void) {
        this.socket?.on(event, callback);
    }

    removeListener(event: string) {
        this.socket?.off(event);
    }

    isConnected(): boolean {
        return !!this.socket?.connected;
    }
}