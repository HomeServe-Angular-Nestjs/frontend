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
import { ICE_SERVERS } from "../../../../../../environments/env";

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

  isMinimized = false;
  isAudioEnabled = true;
  isVideoEnabled = true;
  role!: VideoRoleType;

  // drag state
  private target = { x: 0, y: 0 };
  private current = { x: 0, y: 0 };
  private offset = { x: 0, y: 0 };
  private animationFrame?: number;
  dragging = false;
  transform = "translate3d(0px, 0px, 0px)";

  showRemotePlayButton = false;

  constructor() {
    effect(() => {
      const r = this._videoSocketService.role();
      if (r) {
        this.role = r;
        console.log("Video role set:", r);
      }
    });
  }

  async ngOnInit() {
    console.log(`[VideoCall] Init. Role: ${this.role}`);

    try {
      this._pc = new RTCPeerConnection({
        iceServers: ICE_SERVERS,
        iceTransportPolicy: "all",
      });
      console.log('[VideoCall] PeerConnection created');

      (window as any)._pc = this._pc;

      // this._pc.addTransceiver("video", { direction: "sendrecv" });
      // this._pc.addTransceiver("audio", { direction: "sendrecv" });

      this._pc.onconnectionstatechange = () => {
        console.log('[VideoCall] Connection State:', this._pc.connectionState);
        if (this._pc.connectionState === 'disconnected' || this._pc.connectionState === 'failed') {
          console.warn('[VideoCall] Peer disconnected!');
          // Optionally handle UI feedback here
        }
      };

      this._pc.oniceconnectionstatechange = () => {
        console.log('[VideoCall] ICE Connection State:', this._pc.iceConnectionState);
        if (this._pc.iceConnectionState === 'failed') {
          console.error('[VideoCall] ICE Connection Failed! Check STUN/TURN servers.');
          this._pc.restartIce();
        }
      };

      this._pc.ontrack = (event) => {
        console.log('[VideoCall] Received Remote Track:', event.track.kind, event.streams[0]?.id);
        console.log('[Caller] ontrack fired:', event.track.kind, event.streams);

        // prevent duplicates
        if (!this.remoteStream.getTracks().some(t => t.id === event.track.id)) {
          console.log('[VideoCall] Adding remote track to stream');
          this.remoteStream.addTrack(event.track);
        }

        const rv = this.remoteVideoRef?.nativeElement;
        if (rv) {
          // 1. Set Critical Attributes
          rv.muted = true; // START MUTED to allow autoplay
          rv.playsInline = true;
          rv.autoplay = true;

          // 2. Set Source
          rv.srcObject = this.remoteStream;

          // 3. Play when ready
          rv.onloadedmetadata = () => {
            console.log('[VideoCall] Remote video metadata loaded. Attempting play...');
            rv.play()
              .then(() => {
                console.log('[VideoCall] Remote video playing successfully');
                rv.muted = false; // Unmute after successful play if desired, or let user unmute
              })
              .catch(err => {
                console.warn("Remote video play blocked (Autoplay Policy):", err);
                this.showRemotePlayButton = true; // Show fallback UI
              });
          };
        }
      };

      this._pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[VideoCall] Sending ICE candidate');
          this._videoSocketService.sendSignal({
            type: "ice-candidate",
            candidate: event.candidate,
          });
        }
      };

      this._videoSocketService.onAccept(async () => {
        console.log('[VideoCall] Call Accepted (Caller view)');
        if (this.role !== "caller") return;

        await this.ensureLocalStream();
        this._maybeAddLocalTracks();
        await this._startOffer();
      });

      this._registerSignalHandlers();

      this._videoSocketService.initSignalListener();

    } catch (error) {
      console.error('[VideoCall] Initialization error:', error);
    }
  }

  async ngAfterViewInit() {
    console.log('[VideoCall] View Init (Active Media Request Disabled)');
    // DO NOT Call media here. It is triggered by onAccept or onSignal('offer')
  }

  private _maybeAddLocalTracks() {
    if (this.tracksAdded || !this.localStream) return;

    console.log(`[VideoCall] Adding ${this.localStream.getTracks().length} local tracks to PC`);
    this.localStream.getTracks().forEach((track) => {
      this._pc.addTrack(track, this.localStream!);
    });
    this.tracksAdded = true;
  }

  private _streamPromise: Promise<MediaStream | null> | null = null;

  private async ensureLocalStream() {
    // 1. If we already have a stream, reuse it.
    if (this.localStream && this.localStream.active) {
      this._attachLocalStreamToVideo();
      this._maybeAddLocalTracks(); // CRITICAL: Ensure tracks added if stream pre-exists
      return this.localStream;
    }

    // 2. If a request is already in-flight, return that promise (Singleton Request)
    if (this._streamPromise) {
      console.log('[VideoCall] Stream request in progress, joining existing promise...');
      try {
        const stream = await this._streamPromise;
        if (stream) {
          this.localStream = stream;
          this._attachLocalStreamToVideo();
          this._maybeAddLocalTracks(); // CRITICAL: Ensure tracks added for piggybacker
        }
        return stream;
      } catch (e) {
        return null;
      }
    }

    // 3. Start a new request
    console.log('[VideoCall] Initiating new media request...');
    this._streamPromise = this._acquireStream();

    try {
      this.localStream = await this._streamPromise;
      if (this.localStream) {
        this._attachLocalStreamToVideo();
        this._maybeAddLocalTracks(); // CRITICAL: Ensure tracks added for creator
      }
      return this.localStream;
    } finally {
      // 4. Always clear the promise so future calls can retry if this one failed
      this._streamPromise = null;
    }
  }

  private async _acquireStream(): Promise<MediaStream | null> {
    try {
      console.log('[VideoCall] Opening Camera/Mic...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      console.log('[VideoCall] Media Access Granted:', stream.id);
      return stream;
    } catch (err) {
      console.error('[VideoCall] Media Access Denied/Failed:', err);
      return null;
    }
  }

  private _stopAllTracks() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = undefined;
    }
    // Force clear video src to help browser release lock
    if (this.localVideoRef?.nativeElement) {
      this.localVideoRef.nativeElement.srcObject = null;
    }
  }

  private async _attachLocalStreamToVideo() {
    if (!this.localVideoRef?.nativeElement || !this.localStream) return;

    const lv = this.localVideoRef.nativeElement;
    // Only set if different to avoid reloading
    if (lv.srcObject !== this.localStream) {
      console.log('[VideoCall] Attaching local stream to video element');
      lv.muted = true; // Always mute local video
      lv.autoplay = true;
      lv.playsInline = true;
      lv.srcObject = this.localStream;
      await lv.play().catch(e => console.warn('[VideoCall] Local video play warning:', e));
    }
  }

  private _registerSignalHandlers() {
    this._videoSocketService.onSignal("offer", async (data) => {
      console.log('[VideoCall] Received OFFER (Callee)');

      // 1️⃣ Apply remote offer FIRST (mandatory)
      await this._pc.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );
      console.log('[VideoCall] Remote Description set (Offer)');

      // 2️⃣ Acquire local media (single-shot, no retries, no lifecycle hooks)
      const stream = await this.ensureLocalStream();
      if (!stream) {
        console.error('[VideoCall] Local media unavailable');
        return;
      }

      // 3️⃣ Add tracks EXACTLY ONCE before createAnswer
      if (!this.tracksAdded && this.localStream) {
        console.log('[VideoCall] Binding local tracks to transceivers (callee)');

        const senders = this._pc.getSenders();

        this.localStream.getTracks().forEach(track => {
          const sender = senders.find(s => s.track?.kind === track.kind);

          if (sender) {
            sender.replaceTrack(track);
          }
        });

        this.tracksAdded = true;
      }

      // 4️⃣ Create SDP answer (safe now)
      const answer = await this._pc.createAnswer();
      console.log('[VideoCall] Answer created');

      // 5️⃣ Apply local description
      await this._pc.setLocalDescription(answer);
      console.log('[VideoCall] Local Description set (Answer)');

      // 6️⃣ Send answer to caller
      this._videoSocketService.sendSignal({
        type: "answer",
        answer,
      });
      console.log('[VideoCall] ANSWER sent');

      // 7️⃣ Process buffered ICE (unchanged)
      this._processPendingIce();
    });


    this._videoSocketService.onSignal("answer", async (data) => {
      console.log('[VideoCall] Received ANSWER');
      console.log('[VideoCall] Setting Remote Description (Answer)');
      await this._pc.setRemoteDescription(new RTCSessionDescription(data.answer));

      this._processPendingIce();
    });

    this._videoSocketService.onSignal("ice-candidate", async (data) => {
      console.log('[VideoCall] Received Remote ICE Candidate');
      const candidate = new RTCIceCandidate(data.candidate);
      if (!this._pc.remoteDescription) {
        console.log('[VideoCall] Buffering ICE candidate (remote desc not set)');
        this.pendingIce.push(candidate);
      } else {
        await this.addIceCandidateSafe(candidate);
      }
    });
  }

  private async _processPendingIce() {
    if (this.pendingIce.length > 0) {
      console.log(`[VideoCall] Processing ${this.pendingIce.length} buffered ICE candidates`);
      for (const candidate of this.pendingIce) {
        await this.addIceCandidateSafe(candidate);
      }
      this.pendingIce = [];
    }
  }

  private async addIceCandidateSafe(candidate: RTCIceCandidate) {
    try {
      await this._pc.addIceCandidate(candidate);
      console.log('[VideoCall] Added ICE candidate successfully');
    } catch (e) {
      console.error('[VideoCall] Failed to add ICE candidate', e);
    }
  }

  private async _startOffer() {
    console.log('[VideoCall] Starting Offer...');
    const offer = await this._pc.createOffer();
    console.log('[VideoCall] Setting Local Description (Offer)');
    await this._pc.setLocalDescription(offer);

    console.log('[VideoCall] Sending OFFER signal');
    this._videoSocketService.sendSignal({ type: "offer", offer });
  }

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

  endCall() {
    console.log('[VideoCall] Ending Call - Cleanup started');

    // Stop all local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        console.log(`[VideoCall] Stopping local track: ${track.kind}`);
        track.stop();
      });
      this.localStream = undefined; // Clear reference
    }

    // Close PeerConnection
    if (this._pc) {
      try {
        this._pc.ontrack = null;
        this._pc.onicecandidate = null;
        this._pc.oniceconnectionstatechange = null;
        this._pc.onconnectionstatechange = null;
        this._pc.close();
        console.log('[VideoCall] PeerConnection closed');
      } catch (e) {
        console.warn('[VideoCall] Error closing PC', e);
      }
    }

    this._videoCallService.endCall();
    this._videoSocketService.disconnect();
  }

  // Smooth Dragging
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
    console.log('[VideoCall] Component Destroyed');
    this.endCall();
  }
}
