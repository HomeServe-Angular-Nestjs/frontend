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
  private pendingIce: RTCIceCandidateInit[] = [];
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
    this._pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceTransportPolicy: "relay",
    });

    (window as any)._pc = this._pc;

    this._pc.addTransceiver("video", { direction: "sendrecv" });
    this._pc.addTransceiver("audio", { direction: "sendrecv" });

    this._pc.ontrack = (event) => {
      console.log("REMOTE TRACK:", event.track.kind);

      // prevent duplicates
      if (!this.remoteStream.getTracks().some(t => t.id === event.track.id)) {
        this.remoteStream.addTrack(event.track);
      }

      const rv = this.remoteVideoRef?.nativeElement;
      if (rv && rv.srcObject !== this.remoteStream) {
        rv.srcObject = this.remoteStream;
        rv.muted = false;
        rv.playsInline = true;
        rv.autoplay = true;

        rv.onloadedmetadata = () => {
          rv.play().catch(err => {
            console.warn("Remote video play blocked:", err);
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

    this._videoSocketService.onAccept(async () => {
      if (this.role !== "caller") return;

      await this.ensureLocalStream();
      this._maybeAddLocalTracks();
      await this._startOffer();
    });

    this._registerSignalHandlers();
    this._videoSocketService.initSignalListener();

    // this.localStream = await navigator.mediaDevices
    //   .getUserMedia({ audio: true, video: true })
    //   .catch(() => null);
    // if (this.localStream) {
    //   this._maybeAddLocalTracks();
    // }
  }

  async ngAfterViewInit() {
    if (!this.localStream) {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
    }

    const lv = this.localVideoRef.nativeElement;
    lv.muted = true;
    lv.autoplay = true;
    lv.playsInline = true;
    lv.srcObject = this.localStream;
    await lv.play().catch(() => { });

    this._maybeAddLocalTracks();
  }

  private _maybeAddLocalTracks() {
    if (this.tracksAdded || !this.localStream) return;

    this.localStream.getTracks().forEach((track) => {
      this._pc.addTrack(track, this.localStream!);
    });
    this.tracksAdded = true;
  }

  private async ensureLocalStream() {
    if (this.localStream) return this.localStream;

    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    this._maybeAddLocalTracks();
    return this.localStream;
  }

  private _registerSignalHandlers() {
    this._videoSocketService.onSignal("offer", async (data) => {
      await this.ensureLocalStream();
      await this._pc.setRemoteDescription(data.offer);

      const answer = await this._pc.createAnswer();
      await this._pc.setLocalDescription(answer);

      this._videoSocketService.sendSignal({ type: "answer", answer });
    });

    this._videoSocketService.onSignal("answer", async (data) => {
      await this._pc.setRemoteDescription(data.answer);

      while (this.pendingIce.length) {
        await this._pc.addIceCandidate(this.pendingIce.shift()!);
      }
    });

    this._videoSocketService.onSignal("ice-candidate", async (data) => {
      if (!this._pc.remoteDescription) {
        this.pendingIce.push(data.candidate);
      } else {
        await this._pc.addIceCandidate(data.candidate);
      }
    });
  }

  private async _startOffer() {
    const offer = await this._pc.createOffer();
    await this._pc.setLocalDescription(offer);
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
    // Reserved for UI logic
  }

  endCall() {
    this.localStream?.getTracks().forEach((track) => track.stop());
    try {
      this._pc.close();
    } catch { }
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
    try {
      this._pc && this._pc.getSenders().forEach((s) => s.track?.stop());
    } catch { }
    this.endCall();
  }
}
