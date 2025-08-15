import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { VideoCallService } from "../../../../../core/services/video-call.service";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-video-call',
    templateUrl: './video-call.component.html',
    imports: [CommonModule],
})
export class VideoCallComponent implements OnInit, OnDestroy {
    private readonly _videoCallService = inject(VideoCallService);

    @ViewChild('localVideo')
    localVideoRef!: ElementRef<HTMLVideoElement>;

    private localStream?: MediaStream;
    private _pc!: RTCPeerConnection;

    isOnFullScreen = true;
    isVideoEnabled = true;
    isAudioEnabled = true

    async ngOnInit() {
        this._pc = new RTCPeerConnection();
        this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

        if (this.localStream) {
            this.localStream.getTracks().forEach(track =>
                this._pc.addTrack(track, this.localStream!)
            );
            this.localVideoRef.nativeElement.srcObject = this.localStream;
        }
    }

    ngOnDestroy(): void {
        this.localStream?.getTracks().forEach(track => track.stop());
        this._pc.close();
    }

    endCall() {
        this._videoCallService.endCall();
    }

    toggleFullScreen() {
        this.isOnFullScreen = !this.isOnFullScreen;
    }

    toggleVideoEnabling() {
        this.isVideoEnabled = !this.isVideoEnabled;
        this.localStream?.getVideoTracks().forEach(track => track.enabled = this.isVideoEnabled);
    }

    toggleAudioEnabling() {
        this.isAudioEnabled = !this.isAudioEnabled;
        this.localStream?.getAudioTracks().forEach(track => track.enabled = this.isAudioEnabled);
    }
}