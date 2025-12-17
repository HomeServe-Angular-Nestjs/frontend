import { inject, Injectable, Injector, signal } from "@angular/core";
import { BaseSocketService } from "./base-socket.service";
import { VideoCallService } from "../video-call.service";

export type VideoRoleType = 'caller' | 'callee';

@Injectable({ providedIn: 'root' })
export class VideoCallSocketService extends BaseSocketService {
  private injector = inject(Injector);
  private callService?: VideoCallService;

  protected override namespace: string = '/video-call';

  private SIGNAL = 'video-call:signal';
  private VIDEO_CALL_ROLE = 'video-call:role';
  private VIDEO_CALL_USER_JOIN = 'video-call:join';
  private VIDEO_CALL_INITIATE = 'video-call:initiate';
  private VIDEO_CALL_RINGING = 'video-call:ringing';
  private VIDEO_CALL_ACCEPT = 'video-call:accept';
  private VIDEO_CALL_LEAVE = 'video-call:leave';
  private VIDEO_CALL_UNAVAILABLE = 'video-call:unavailable';

  private _listeners: Record<string, (msg: any) => void> = {};
  private _acceptListener?: (data: any) => void;
  private _ringingListener?: (caller: any) => void;
  private _pendingSignals: any[] = [];
  private _isListening = false;

  readonly role = signal<VideoRoleType | null>(null);
  partnerId!: string;

  constructor() {
    super();
  }

  protected override onConnect(): void {
    console.log('[VideoCallSocket] Connected');
    // ensure listener is active for incoming signals
    this.initSignalListener();

    this.onRinging((data: { callerId: string }) => {
      console.log('Incoming ringing event:', data);
      if (data?.callerId) {
        this.callService ??= this.injector.get(VideoCallService);
        this.callService.showIncomingFloating(data.callerId);
      }
    });
  }

  protected override onDisconnect(reason: string): void {
    console.log('[VideoCallSocket] Disconnected');
  }

  sendSignal(data: any) {
    if (!this.partnerId) {
      console.warn('[VideoCallSocket] partnerId is not set — cannot send signal', data);
      return;
    }

    const full = {
      targetUserId: this.partnerId,
      ...data,
    };

    console.log('📤 Sending signal:', full);
    this.emit(this.SIGNAL, full);
  }

  onSignal(type: string, callback: (msg: any) => void) {
    this._listeners[type] = callback;

    const pending = this._pendingSignals.filter(e => e.type === type);
    for (const event of pending) {
      callback(event);
    }

    this._pendingSignals = this._pendingSignals.filter(e => e.type !== type);
  }

  onJoin(payload: { callee: string }) {
    this.emit(this.VIDEO_CALL_USER_JOIN, payload);
  }

  onRinging(callback: (caller: any) => void) {
    this._ringingListener = callback;
  }

  onAccept(callback: (data: any) => void) {
    this._acceptListener = callback;
  }

  initSignalListener() {
    if (this._isListening) return;
    this._isListening = true;

    this.listen(this.SIGNAL, (event: any) => {
      const type = event?.type;
      console.log('[SIGNAL] received by client:', event);

      if (type && this._listeners[type]) {
        this._listeners[type](event);
      } else {
        this._pendingSignals.push(event);
      }
    });

    this.listen(this.VIDEO_CALL_ROLE, (event: { role: VideoRoleType }) => {
      this.role.set(event.role);
    });

    this.listen(this.VIDEO_CALL_UNAVAILABLE, (event: { message: string }) => {
      // alert(event.message);
    });

    this.listen(this.VIDEO_CALL_RINGING, (event: any) => {
      console.log('📳 Incoming call (socket event):', event);
      if (this._ringingListener) this._ringingListener(event);
    });

    this.listen(this.VIDEO_CALL_ACCEPT, (data) => {
      console.log('✅ Call accepted event:', data);
      if (this._acceptListener) this._acceptListener(data);
    });
  }

  startCall(callee: string) {
    this.partnerId = callee;
    this.emit(this.VIDEO_CALL_INITIATE, { callee });
  }

  acceptCall(callerId: string) {
    this.partnerId = callerId;
    this.emit(this.VIDEO_CALL_ACCEPT, { callerId });
  }

  endCall(partnerId: string) {
    this.emit(this.VIDEO_CALL_LEAVE, { callee: partnerId });
  }
}
