import { Injectable } from "@angular/core";
import { BaseSocketService, ISocketError } from "./base-socket.service";

@Injectable({ providedIn: 'root' })
export class VideoCallSocketService extends BaseSocketService {

    private _listeners: Record<string, (msg: any) => void> = {};

    protected override namespace: string = 'video-call';


    constructor() {
        super();
    }

    protected override onConnect(): void {
        console.log('[VideoCallSocket] Connected');
    }

    protected override onDisconnect(reason: string): void { }


    sendSignal(data: any) {
        this.emit('signal', data);
    }

    onSignal(type: string, callback: (msg: any) => void) {
        this._listeners[type] = callback;
    }

    onNewSignalingMessage(event: any) {
        const type = event?.type;
        if (type && this._listeners[type]) {
            this._listeners[type](event);
        }
    }

    stopListeningToSignals() {

    }
}