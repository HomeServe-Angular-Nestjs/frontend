import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
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
  role: VideoRoleType = "caller";

  // drag state
  private target = { x: 0, y: 0 };
  private current = { x: 0, y: 0 };
  private offset = { x: 0, y: 0 };
  private animationFrame?: number;
  dragging = false;
  transform = "translate3d(0px, 0px, 0px)";

  async ngOnInit() {
    const tag = this.role === "caller" ? "CALLER" : "CALLEE";
    console.log(`${tag}: Initializing RTCPeerConnection`);

    this._pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    (window as any)._pc = this._pc;

    this.remoteStream = new MediaStream();

    this._pc.ontrack = (event) => {
      const tracks =
        (event.streams && event.streams[0]?.getTracks()) ||
        (event.track ? [event.track] : []);
      tracks.forEach((track) => {
        const exists = this.remoteStream.getTracks().some((t) => t.id === track.id);
        if (!exists) {
          this.remoteStream.addTrack(track);
        }
      });

      if (this.remoteVideoRef?.nativeElement) {
        try {
          const rv = this.remoteVideoRef.nativeElement;
          if (rv.srcObject !== this.remoteStream) rv.srcObject = this.remoteStream;
          rv.play().catch(() => { });
        } catch { }
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

    this._videoSocketService.onAccept(async (data) => {
      if (this.role === "caller") {
        try {
          await this.ensureLocalStream(tag);
          await this._startOffer(tag);
        } catch (err) {
          console.error(`${tag}: Failed to start offer after accept`, err);
        }
      }
    });

    this._registerSignalHandlers(tag);
    this._videoSocketService.initSignalListener();

    try {
      this.localStream = await navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .catch(() => null);
      if (this.localStream) {
        this._maybeAddLocalTracks();
      }
    } catch (e) {
      console.warn(`${tag}: Failed to prefetch local stream`, e);
    }
  }

  async ngAfterViewInit() {
    const tag = this.role === "caller" ? "CALLER" : "CALLEE";
    console.log(`${tag}: Setting up local and remote video`);

    if (!this.localStream || !this.localStream.getTracks().length) {
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
      } catch (err) {
        console.error(`${tag}: Failed to getUserMedia`, err);
        return;
      }
    }

    if (this.localVideoRef && this.localStream) {
      const lv = this.localVideoRef.nativeElement;
      lv.muted = true;
      lv.playsInline = true;
      lv.autoplay = true;
      if (lv.srcObject !== this.localStream) lv.srcObject = this.localStream;
      await lv.play().catch(() => { });
    }

    this._maybeAddLocalTracks();

    if (this.remoteVideoRef) {
      const rv = this.remoteVideoRef.nativeElement;
      rv.muted = true;
      rv.playsInline = true;
      rv.autoplay = true;
      if (rv.srcObject !== this.remoteStream) rv.srcObject = this.remoteStream;
      await rv.play().catch(() => { });
    }

    if (this.role === "caller" && this._pc.signalingState === "stable") {
      await this._startOffer(tag).catch(() => { });
    }

    this._startStatsPolling(tag);
  }

  private _maybeAddLocalTracks() {
    if (this.tracksAdded || !this.localStream) return;
    try {
      this.localStream.getTracks().forEach((track) => {
        this._pc.addTrack(track, this.localStream!);
      });
      this.tracksAdded = true;
    } catch (e) {
      console.warn("Failed to add local tracks:", e);
    }
  }

  private async ensureLocalStream(tag: string) {
    if (this.localStream && this.localStream.getTracks().length) {
      this._maybeAddLocalTracks();
      return this.localStream;
    }
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    this._maybeAddLocalTracks();
    return this.localStream;
  }

  private _registerSignalHandlers(tag: string) {
    this._videoSocketService.onSignal("offer", async (data) => {
      try {
        await this.ensureLocalStream(tag);
        await this._pc.setRemoteDescription(new RTCSessionDescription(data.offer));

        const answer = await this._pc.createAnswer();
        await this._pc.setLocalDescription(answer);
        this._videoSocketService.sendSignal({ type: "answer", answer });
      } catch (err) {
        console.error(`${tag}: Error handling offer`, err);
      }
    });

    this._videoSocketService.onSignal("answer", async (data) => {
      try {
        if (this._pc.signalingState === "have-local-offer") {
          await this._pc.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
          while (this.pendingIce.length) {
            const c = this.pendingIce.shift()!;
            await this._pc.addIceCandidate(c);
          }
        }
      } catch (err) {
        console.error(`${tag}: Error setting remote description`, err);
      }
    });

    this._videoSocketService.onSignal("ice-candidate", async (data) => {
      try {
        if (!this._pc.remoteDescription?.type) {
          this.pendingIce.push(data.candidate);
        } else {
          await this._pc.addIceCandidate(data.candidate);
        }
      } catch (err) {
        console.error(`${tag}: Error adding ICE candidate`, err);
      }
    });
  }

  private async _startOffer(tag: string) {
    try {
      await this.ensureLocalStream(tag);
      const offer = await this._pc.createOffer();
      await this._pc.setLocalDescription(offer);
      this._videoSocketService.sendSignal({ type: "offer", offer });
    } catch (e) {
      console.error(`${tag}: Failed to create/send offer`, e);
      throw e;
    }
  }

  private _startStatsPolling(tag: string) {
    let count = 0;
    const interval = setInterval(async () => {
      count++;
      const stats = await this._pc.getStats();
      stats.forEach((r) => {
        if (r.type === "inbound-rtp" && (r.kind === "video" || r.mediaType === "video")) {
          console.log(`${tag}: inbound-rtp`, {
            bytesReceived: (r as any).bytesReceived,
            framesDecoded: (r as any).framesDecoded,
          });
        }
        if (r.type === "outbound-rtp" && (r.kind === "video" || r.mediaType === "video")) {
          console.log(`${tag}: outbound-rtp`, {
            bytesSent: (r as any).bytesSent,
            framesEncoded: (r as any).framesEncoded,
          });
        }
      });
      if (count > 30) clearInterval(interval);
    }, 2000);
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
