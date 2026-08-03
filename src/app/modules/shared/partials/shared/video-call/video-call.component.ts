import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  effect,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  VideoCallSocketService,
  VideoRoleType,
} from "../../../../../core/services/socket-service/video-socket.service";
import { VideoCallService } from "../../../../../core/services/video-call.service";
import { CallEndReason } from "../../../../../core/enums/enums";

const MAX_ICE_RECOVERY_RETRIES = 3;
const MAX_PC_REBUILDS = 2;
const DISCONNECT_RECOVERY_MS = 5000;
const END_SCREEN_MS = 2000;

@Component({
  selector: "app-video-call",
  templateUrl: "./video-call.component.html",
  imports: [CommonModule],
})
export class VideoCallComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly _videoSocketService = inject(VideoCallSocketService);
  private readonly _videoCallService = inject(VideoCallService);

  @ViewChild("localVideo") localVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild("remoteVideo") remoteVideoRef!: ElementRef<HTMLVideoElement>;

  private _pc!: RTCPeerConnection;
  private localStream?: MediaStream | null = null;
  private remoteStream: MediaStream = new MediaStream();
  private pendingIce: RTCIceCandidate[] = [];
  private tracksAdded = false;

  private _iceRetryCount = 0;
  private _pcRebuilds = 0;
  private _recoveryInProgress = false;
  private _disconnectedTimer?: ReturnType<typeof setInterval>;
  private _closeTimer?: ReturnType<typeof setTimeout>;

  isMinimized = false;
  isAudioEnabled = true;
  isVideoEnabled = true;
  role!: VideoRoleType;
  partnerId!: string;

  callStatus: 'connecting' | 'calling' | 'connected' | 'ended' = 'calling';
  callDuration = 0;
  private _timerInterval?: ReturnType<typeof setInterval>;

  endReasonDisplay: CallEndReason | null = null;
  peerReconnecting = false;

  private readonly MEDIA_TIMEOUT_MS = 20000;
  private _mediaAcquisitionAborted = false;

  // drag state
  private target = { x: 0, y: 0 };
  private current = { x: 0, y: 0 };
  private offset = { x: 0, y: 0 };
  private animationFrame?: number;
  dragging = false;
  transform = "translate3d(0px, 0px, 0px)";

  showRemotePlayButton = false;

  private _callEnded = false;

  constructor() {
    effect(() => {
      const r = this._videoSocketService.role();
      if (r) {
        this.role = r;
      }
    });
  }

  async ngOnInit() {
    console.log(`[VideoCall] Init. Role: ${this.role}`);
    this._mediaAcquisitionAborted = false;
    this._callEnded = false;

    try {
      await this._createPeerConnection();

      this._videoSocketService.onAccept(async (data) => {
        if (this.role !== "caller") return;
        if (data?.callId && data.callId !== this._videoSocketService.callId()) return;
        if (this.callStatus === 'connected' || this.callStatus === 'connecting') return;

        console.log('[VideoCall] Call Accepted (Caller view)');
        this.callStatus = 'connecting';
        this._startTimer();

        const stream = await this.ensureLocalStream();
        if (!stream) {
          console.error('[VideoCall] Caller media unavailable — ending call');
          this._videoSocketService.sendSignal({ type: "media-error" });
          this.showEndReason(CallEndReason.FAILED);
          return;
        }
        this.callStatus = 'connected';
        await this._startOffer();
      });

      this._registerSignalHandlers();
      this._registerReconnectHandlers();

      this._videoSocketService.initSignalListener();
    } catch (error) {
      console.error('[VideoCall] Initialization error:', error);
      this.showEndReason(CallEndReason.FAILED);
    }
  }

  async ngAfterViewInit() {
    console.log('[VideoCall] View Init (Active Media Request Disabled)');
  }

  /* ============================== Peer Connection ============================== */

  private async _createPeerConnection() {
    const iceServers = await this._videoCallService.getIceServers();
    this._pc = new RTCPeerConnection({
      iceServers,
      iceTransportPolicy: "all",
    });
    this.tracksAdded = false;
    this._setupPeerConnectionHandlers();
    return this._pc;
  }

  private _setupPeerConnectionHandlers() {
    this._pc.onconnectionstatechange = () => {
      console.log('[VideoCall] Connection State:', this._pc.connectionState);
      if (this._pc.connectionState === 'failed') {
        this._handleIceRecovery();
      }
    };

    this._pc.oniceconnectionstatechange = () => {
      console.log('[VideoCall] ICE Connection State:', this._pc.iceConnectionState);
      this._handleIceConnectionState(this._pc.iceConnectionState);
    };

    this._pc.ontrack = (event) => {
      if (!this.remoteStream.getTracks().some(t => t.id === event.track.id)) {
        this.remoteStream.addTrack(event.track);
      }

      const rv = this.remoteVideoRef?.nativeElement;
      if (rv) {
        rv.muted = true;
        rv.playsInline = true;
        rv.autoplay = true;
        rv.srcObject = this.remoteStream;

        rv.onloadedmetadata = () => {
          rv.play()
            .then(() => {
              console.log('[VideoCall] Remote video playing successfully');
              rv.muted = false;
            })
            .catch((err) => {
              console.warn("Remote video play blocked (Autoplay Policy):", err);
              this.showRemotePlayButton = true;
            });
        };
      }
    };

    this._pc.onicecandidate = (event) => {
      if (event.candidate) {
        this._videoSocketService.sendSignal({
          type: "ice-candidate",
          candidate: event.candidate,
        });
      }
    };
  }

  /* ============================== ICE Recovery ============================== */

  private _handleIceConnectionState(state: RTCIceConnectionState) {
    if (this._callEnded) return;

    if (state === 'connected' || state === 'completed') {
      this._iceRetryCount = 0;
      this._stopDisconnectedRecovery();
    } else if (state === 'disconnected') {
      this._startDisconnectedRecovery();
    } else if (state === 'failed') {
      this._stopDisconnectedRecovery();
      this._handleIceRecovery();
    }
  }

  private _startDisconnectedRecovery() {
    if (this._disconnectedTimer) return;
    this._disconnectedTimer = setInterval(() => {
      if (this._callEnded || !this._pc) {
        this._stopDisconnectedRecovery();
        return;
      }
      if (this._pc.iceConnectionState === 'disconnected') {
        this._handleIceRecovery();
      }
    }, DISCONNECT_RECOVERY_MS);
  }

  private _stopDisconnectedRecovery() {
    if (this._disconnectedTimer) {
      clearInterval(this._disconnectedTimer);
      this._disconnectedTimer = undefined;
    }
  }

  private async _handleIceRecovery() {
    if (this._callEnded || this._recoveryInProgress || !this._pc) return;
    this._recoveryInProgress = true;

    try {
      if (this._iceRetryCount >= MAX_ICE_RECOVERY_RETRIES) {
        if (this._pcRebuilds >= MAX_PC_REBUILDS) {
          console.error('[VideoCall] Recovery exhausted — ending call');
          this.showEndReason(CallEndReason.FAILED);
          return;
        }
        await this._rebuildPeerConnection();
        return;
      }

      this._iceRetryCount++;
      console.log(`[VideoCall] ICE restart attempt #${this._iceRetryCount}`);
      this._pc.restartIce();
      await this._startOffer();
    } catch (e) {
      console.error('[VideoCall] ICE recovery failed:', e);
    } finally {
      this._recoveryInProgress = false;
    }
  }

  private async _rebuildPeerConnection() {
    console.log('[VideoCall] Rebuilding PeerConnection (fresh PC + full re-offer)');
    this._pcRebuilds++;
    this._closePeerConnection();
    await this._createPeerConnection();

    if (this.localStream) {
      this._maybeAddLocalTracks();
    }
    await this._startOffer();
  }

  private _handleSocketReconnected() {
    if (this._callEnded || !this._pc) return;

    const state = this._pc.iceConnectionState;
    if (state === 'failed' || state === 'disconnected') {
      this._iceRetryCount = 0;
      this._handleIceRecovery();
    }
  }

  /* ============================== Signal Handlers ============================== */

  private _registerReconnectHandlers() {
    this._videoSocketService.onPeerReconnecting(() => {
      this.peerReconnecting = true;
    });
    this._videoSocketService.onRejoined(() => {
      this.peerReconnecting = false;
    });
    this._videoSocketService.onSocketReconnected(() => this._handleSocketReconnected());
  }

  private _registerSignalHandlers() {
    this._videoSocketService.onSignal("offer", async (data) => {
      if (!this._isCurrentCall(data) || this.role !== 'callee') return;

      console.log('[VideoCall] Received OFFER (Callee)');

      if (this.callStatus !== 'connected') {
        this.callStatus = 'connecting';
        this._startTimer();
      }

      await this._pc.setRemoteDescription(new RTCSessionDescription(data.offer));

      if (!this.localStream) {
        const stream = await this._acquireStream();
        if (!stream) {
          console.error('[VideoCall] Local media unavailable — ending call');
          this._videoSocketService.sendSignal({ type: "media-error" });
          this.showEndReason(CallEndReason.FAILED);
          return;
        }
        this.localStream = stream;
        this._attachLocalStreamToVideo();
        await this._bindLocalTracksToTransceivers();
      }

      const answer = await this._pc.createAnswer();
      await this._pc.setLocalDescription(answer);
      this._videoSocketService.sendSignal({ type: "answer", answer });
      this.callStatus = 'connected';

      this._processPendingIce();
    });

    this._videoSocketService.onSignal("answer", async (data) => {
      if (!this._isCurrentCall(data) || this.role !== 'caller') return;
      console.log('[VideoCall] Received ANSWER');
      await this._pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      this._processPendingIce();
    });

    this._videoSocketService.onSignal("media-error", () => {
      console.error('[VideoCall] Peer failed to acquire media');
      this.showEndReason(CallEndReason.FAILED);
    });

    this._videoSocketService.onSignal("ice-candidate", async (data) => {
      if (!this._isCurrentCall(data)) return;
      const candidate = new RTCIceCandidate(data.candidate);
      if (!this._pc.remoteDescription) {
        this.pendingIce.push(candidate);
      } else {
        await this.addIceCandidateSafe(candidate);
      }
    });
  }

  private _isCurrentCall(data: { callId?: string }): boolean {
    const currentCallId = this._videoSocketService.callId();
    if (!currentCallId || !data?.callId) return false;
    return data.callId === currentCallId;
  }

  private async _bindLocalTracksToTransceivers() {
    if (!this.localStream) return;
    const transceivers = this._pc.getTransceivers();
    for (const track of this.localStream.getTracks()) {
      const transceiver = transceivers.find(t => t.receiver.track?.kind === track.kind);
      if (transceiver) {
        transceiver.direction = 'sendrecv';
        await transceiver.sender.replaceTrack(track);
      }
    }
    this.tracksAdded = true;
  }

  /* ============================== Media ============================== */

  private _maybeAddLocalTracks() {
    if (this.tracksAdded || !this.localStream) return;
    this.localStream.getTracks().forEach((track) => {
      this._pc.addTrack(track, this.localStream!);
    });
    this.tracksAdded = true;
  }

  private _streamPromise: Promise<MediaStream | null> | null = null;

  private async ensureLocalStream() {
    if (this.localStream && this.localStream.active) {
      this._attachLocalStreamToVideo();
      this._maybeAddLocalTracks();
      return this.localStream;
    }

    if (this._streamPromise) {
      try {
        const stream = await this._streamPromise;
        if (stream) {
          this.localStream = stream;
          this._attachLocalStreamToVideo();
          this._maybeAddLocalTracks();
        }
        return stream;
      } catch (e) {
        return null;
      }
    }

    this._streamPromise = this._acquireStream();

    try {
      this.localStream = await this._streamPromise;
      if (this.localStream) {
        this._attachLocalStreamToVideo();
        this._maybeAddLocalTracks();
      }
      return this.localStream;
    } finally {
      this._streamPromise = null;
    }
  }

  private async _acquireStream(): Promise<MediaStream | null> {
    try {
      const stream = await this._withTimeout(
        navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        }),
        this.MEDIA_TIMEOUT_MS,
        'Media acquisition timed out (camera may be in use)'
      );
      if (this._mediaAcquisitionAborted) {
        stream.getTracks().forEach(t => t.stop());
        return null;
      }
      return stream;
    } catch (err: any) {
      if (this._mediaAcquisitionAborted) return null;
      console.error('[VideoCall] Media Access Denied/Failed:', err);
      return null;
    }
  }

  private _withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(errorMsg)), ms);
      promise.then(
        val => { clearTimeout(timer); resolve(val); },
        err => { clearTimeout(timer); reject(err); }
      );
    });
  }

  private _stopAllTracks() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = undefined;
    }
    if (this.localVideoRef?.nativeElement) {
      this.localVideoRef.nativeElement.srcObject = null;
    }
  }

  private async _attachLocalStreamToVideo() {
    if (!this.localVideoRef?.nativeElement || !this.localStream) return;

    const lv = this.localVideoRef.nativeElement;
    if (lv.srcObject !== this.localStream) {
      lv.muted = true;
      lv.autoplay = true;
      lv.playsInline = true;
      lv.srcObject = this.localStream;
      await lv.play().catch(e => console.warn('[VideoCall] Local video play warning:', e));
    }
  }

  private async _startOffer() {
    console.log('[VideoCall] Starting Offer...');
    const offer = await this._pc.createOffer();
    await this._pc.setLocalDescription(offer);
    this._videoSocketService.sendSignal({ type: "offer", offer });
  }

  /* ============================== ICE Buffer ============================== */

  private async _processPendingIce() {
    if (this.pendingIce.length > 0) {
      const buffered = this.pendingIce;
      this.pendingIce = [];
      for (const candidate of buffered) {
        await this.addIceCandidateSafe(candidate);
      }
    }
  }

  private async addIceCandidateSafe(candidate: RTCIceCandidate) {
    try {
      await this._pc.addIceCandidate(candidate);
    } catch (e) {
      console.error('[VideoCall] Failed to add ICE candidate', e);
    }
  }

  /* ============================== UI Controls ============================== */

  toggleAudioEnabling() {
    this.isAudioEnabled = !this.isAudioEnabled;
    this.localStream?.getAudioTracks().forEach(
      (track) => (track.enabled = this.isAudioEnabled)
    );
  }

  toggleVideoEnabling() {
    this.isVideoEnabled = !this.isVideoEnabled;
    this.localStream?.getVideoTracks().forEach(
      (track) => (track.enabled = this.isVideoEnabled)
    );
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
  }

  playRemoteVideo() {
    const rv = this.remoteVideoRef?.nativeElement;
    if (rv) {
      rv.play().then(() => {
        this.showRemotePlayButton = false;
        rv.muted = false;
      }).catch(e => console.error("Still blocked", e));
    }
  }

  get formattedDuration(): string {
    const mins = Math.floor(this.callDuration / 60);
    const secs = this.callDuration % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  get endReasonLabel(): string {
    switch (this.endReasonDisplay) {
      case CallEndReason.MISSED: return 'Missed call';
      case CallEndReason.DECLINED: return 'Call declined';
      case CallEndReason.CANCELLED: return 'Call cancelled';
      case CallEndReason.FAILED: return 'Call failed';
      case CallEndReason.DISCONNECTED: return 'Connection lost';
      case CallEndReason.REMOTE_LEFT: return 'Call ended';
      case CallEndReason.TIMEOUT: return 'Call timed out';
      case CallEndReason.ACCEPTED_ELSEWHERE: return 'Call answered elsewhere';
      default: return 'Call ended';
    }
  }

  private _startTimer() {
    this.callDuration = 0;
    this._timerInterval = setInterval(() => {
      this.callDuration++;
    }, 1000);
  }

  private _stopTimer() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = undefined;
    }
  }

  /* ============================== End / Cleanup ============================== */

  /** Local end (user pressed hang-up). Emits the single authoritative leave. */
  endCall() {
    if (this._callEnded) return;
    this._callEnded = true;

    const reason = this.callStatus === 'calling'
      ? CallEndReason.CANCELLED
      : CallEndReason.ENDED;

    this._teardown();
    this._videoSocketService.endCall();
    this._showEndScreen(reason);
  }

  /** Server-driven end (missed, declined, remote left, etc). No leave is emitted. */
  showEndReason(reason: CallEndReason) {
    if (this._callEnded) return;
    this._callEnded = true;

    this._teardown();
    this._showEndScreen(reason);
  }

  private _teardown() {
    this._stopTimer();
    this._stopDisconnectedRecovery();
    this._mediaAcquisitionAborted = true;
    this._stopAllTracks();
    this._closePeerConnection();
  }

  private _closePeerConnection() {
    if (this._pc) {
      try {
        this._pc.ontrack = null;
        this._pc.onicecandidate = null;
        this._pc.oniceconnectionstatechange = null;
        this._pc.onconnectionstatechange = null;
        this._pc.close();
      } catch (e) {
        console.warn('[VideoCall] Error closing PC', e);
      }
      this._pc = undefined as any;
    }
  }

  private _showEndScreen(reason: CallEndReason) {
    this.callStatus = 'ended';
    this.endReasonDisplay = reason;
    this._closeTimer = setTimeout(() => this._videoCallService.endCall(), END_SCREEN_MS);
  }

  /* ============================== Drag ============================== */

  startDrag(event: MouseEvent) {
    if (!this.isMinimized) return;
    event.stopPropagation();
    event.preventDefault();
    this.dragging = true;
    this.offset = {
      x: event.clientX - this.target.x,
      y: event.clientY - this.target.y,
    };
    requestAnimationFrame(() => this.animateDrag());
  }

  private animateDrag() {
    const lerp = (a: number, b: number, t = 0.2) => a + (b - a) * t;
    const animate = () => {
      this.current.x = lerp(this.current.x, this.target.x);
      this.current.y = lerp(this.current.y, this.target.y);
      this.transform = `translate3d(${this.current.x}px, ${this.current.y}px, 0)`;
      if (
        this.dragging ||
        Math.abs(this.current.x - this.target.x) > 0.1 ||
        Math.abs(this.current.y - this.target.y) > 0.1
      ) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };
    this.animationFrame = requestAnimationFrame(animate);
  }

  @HostListener("document:mousemove", ["$event"])
  onDrag(event: MouseEvent) {
    if (!this.dragging || !this.isMinimized) return;
    const newX = event.clientX - this.offset.x;
    const newY = event.clientY - this.offset.y;
    const maxX = window.innerWidth - 320;
    const maxY = window.innerHeight - 220;
    this.target.x = Math.max(0, Math.min(newX, maxX));
    this.target.y = Math.max(0, Math.min(newY, maxY));
  }

  @HostListener("document:mouseup")
  stopDrag() {
    this.dragging = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = undefined;
    }
  }

  @HostListener("window:resize")
  onResize() {
    const maxX = window.innerWidth - 320;
    const maxY = window.innerHeight - 220;
    this.target.x = Math.min(this.target.x, maxX);
    this.target.y = Math.min(this.target.y, maxY);
  }

  ngOnDestroy(): void {
    this._stopTimer();
    this._stopDisconnectedRecovery();
    if (this._closeTimer) clearTimeout(this._closeTimer);

    if (this._callEnded) {
      this._stopAllTracks();
      this._closePeerConnection();
    } else {
      this.endCall();
    }
  }
}
