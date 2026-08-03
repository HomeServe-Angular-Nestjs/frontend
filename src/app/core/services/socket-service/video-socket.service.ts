import { inject, Injectable, Injector, signal } from "@angular/core";
import { BaseSocketService } from "./base-socket.service";
import { VideoCallService } from "../video-call.service";
import {
  IAcceptedEventPayload,
  IEndedEventPayload,
  IInitiatedEventPayload,
  IRingingEventPayload,
} from "../../models/video-call.model";
import { CallEndReason } from "../../enums/enums";

export type VideoRoleType = 'caller' | 'callee';

@Injectable({ providedIn: 'root' })
export class VideoCallSocketService extends BaseSocketService {
  private injector = inject(Injector);
  private callService?: VideoCallService;

  protected override namespace: string = '/video-call';

  private SIGNAL = 'video-call:signal';
  private VIDEO_CALL_INITIATE = 'video-call:initiate';
  private VIDEO_CALL_ACCEPT = 'video-call:accept';
  private VIDEO_CALL_DECLINE = 'video-call:decline';
  private VIDEO_CALL_LEAVE = 'video-call:leave';
  private VIDEO_CALL_JOIN = 'video-call:join';

  private VIDEO_CALL_INITIATED = 'video-call:initiated';
  private VIDEO_CALL_RINGING = 'video-call:ringing';
  private VIDEO_CALL_ACCEPTED = 'video-call:accepted';
  private VIDEO_CALL_ENDED = 'video-call:ended';
  private VIDEO_CALL_UNAVAILABLE = 'video-call:unavailable';
  private VIDEO_CALL_PEER_RECONNECTING = 'video-call:peer-reconnecting';
  private VIDEO_CALL_REJOINED = 'video-call:rejoined';

  private _listeners: Record<string, (msg: any) => void> = {};
  private _pendingSignals: any[] = [];
  private _isListening = false;
  private _acceptListener?: (data: IAcceptedEventPayload) => void;
  private _ringingListener?: (event: IRingingEventPayload) => void;
  private _initiatedListener?: (event: IInitiatedEventPayload) => void;
  private _peerReconnectingListener?: (event: { callId: string }) => void;
  private _rejoinedListener?: (event: { callId: string }) => void;
  private _socketReconnectedListener?: () => void;

  readonly role = signal<VideoRoleType | null>(null);
  readonly callId = signal<string | null>(null);
  readonly endReason = signal<CallEndReason | null>(null);
  partnerId = '';

  constructor() {
    super();
  }

  protected override onConnect(): void {
    console.log('[VideoCallSocket] Connected');
    this.initSignalListener();

    const activeCallId = this.callId();
    if (activeCallId) {
      console.log('[VideoCallSocket] Rejoining active call after reconnect:', activeCallId);
      this.rejoinCall(activeCallId);
      if (this._socketReconnectedListener) this._socketReconnectedListener();
    }
  }

  protected override onDisconnect(reason: string): void {
    console.log('[VideoCallSocket] Disconnected:', reason);
  }

  /* ===================== SIGNAL ===================== */
  sendSignal(data: { type: 'offer' | 'answer' | 'ice-candidate' | 'media-error'; offer?: any; answer?: any; candidate?: any }) {
    const callId = this.callId();
    if (!callId) {
      console.warn('[VideoCallSocket] Cannot send signal without a callId');
      return;
    }
    this.emit(this.SIGNAL, { callId, ...data });
  }

  onSignal(type: string, callback: (msg: any) => void) {
    this._listeners[type] = callback;

    const pending = this._pendingSignals.filter(e => e.type === type);
    pending.forEach(e => callback(e));

    this._pendingSignals = this._pendingSignals.filter(e => e.type !== type);
  }

  /* ===================== CALL FLOW ===================== */
  startCall(callee: string) {
    this.reset();
    this.endReason.set(null);
    this.partnerId = callee;
    this.role.set('caller');
    this.emit(this.VIDEO_CALL_INITIATE, { callee });
  }

  acceptCall(callId: string) {
    this.endReason.set(null);
    this.callId.set(callId);
    this.role.set('callee');
    this.emit(this.VIDEO_CALL_ACCEPT, { callId });
  }

  declineCall(callId: string) {
    this.emit(this.VIDEO_CALL_DECLINE, { callId });
    this.reset();
  }

  endCall() {
    const callId = this.callId();
    if (callId) {
      this.emit(this.VIDEO_CALL_LEAVE, { callId });
    }
    this.reset();
  }

  rejoinCall(callId: string) {
    this.emit(this.VIDEO_CALL_JOIN, { callId });
  }

  /* ===================== EVENT SUBSCRIPTIONS ===================== */
  onInitiated(callback: (event: IInitiatedEventPayload) => void) {
    this._initiatedListener = callback;
  }

  onRinging(callback: (event: IRingingEventPayload) => void) {
    this._ringingListener = callback;
  }

  onAccept(callback: (data: IAcceptedEventPayload) => void) {
    this._acceptListener = callback;
  }

  onPeerReconnecting(callback: (event: { callId: string }) => void) {
    this._peerReconnectingListener = callback;
  }

  onRejoined(callback: (event: { callId: string }) => void) {
    this._rejoinedListener = callback;
  }

  onSocketReconnected(callback: () => void) {
    this._socketReconnectedListener = callback;
  }

  initSignalListener() {
    if (this._isListening) return;
    this._isListening = true;

    this.listen(this.SIGNAL, (event: any) => {
      const type = event?.type;

      if (type && this._listeners[type]) {
        this._listeners[type](event);
      } else {
        this._pendingSignals.push(event);
      }
    });

    this.listen(this.VIDEO_CALL_INITIATED, (event: IInitiatedEventPayload) => {
      this.callId.set(event.callId);
      if (this._initiatedListener) this._initiatedListener(event);
    });

    this.listen(this.VIDEO_CALL_RINGING, (event: IRingingEventPayload) => {
      this.callId.set(event.callId);
      this.partnerId = event.callerId;
      this.callService ??= this.injector.get(VideoCallService);
      this.callService.showIncomingFloating(event.callerId);
      if (this._ringingListener) this._ringingListener(event);
    });

    this.listen(this.VIDEO_CALL_ACCEPTED, (data: IAcceptedEventPayload) => {
      if (this._acceptListener) this._acceptListener(data);
    });

    this.listen(this.VIDEO_CALL_ENDED, (event: IEndedEventPayload) => {
      this.callService ??= this.injector.get(VideoCallService);
      this.callService.handleEnd(event.reason);
      this.reset();
    });

    this.listen(this.VIDEO_CALL_UNAVAILABLE, (event: { message: string }) => {
      this._toastr.error(event?.message || 'Call unavailable');
      this.callService ??= this.injector.get(VideoCallService);
      this.callService.handleEnd(CallEndReason.FAILED);
      this.reset();
    });

    this.listen(this.VIDEO_CALL_PEER_RECONNECTING, (event: { callId: string }) => {
      if (this._peerReconnectingListener) this._peerReconnectingListener(event);
    });

    this.listen(this.VIDEO_CALL_REJOINED, (event: { callId: string }) => {
      if (this._rejoinedListener) this._rejoinedListener(event);
    });
  }

  private reset() {
    this.callId.set(null);
    this.role.set(null);
    this.partnerId = '';
    this._pendingSignals = [];
  }
}
