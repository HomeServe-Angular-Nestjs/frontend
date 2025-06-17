import { Injectable, OnInit } from "@angular/core";
import { io, Socket } from 'socket.io-client';
import { SOCKET_API } from "../../../environments/api.environments";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ChatService {
    private readonly socketApi = SOCKET_API.chat;
    private socket: Socket;

    constructor() {
        this.socket = io(this.socketApi);
        this.socket.on('connect', () => {
            console.log('Connected to server with ID:', this.socket.id);
        });
    }

    sendMessage(msg: string): void {
        this.socket.emit('chat', msg);
    }

    getMessage() {
        return new Observable<string>(observer => {
            this.socket.on('chat', (message: string) => {
                observer.next(message);
            });
        });
    }
}