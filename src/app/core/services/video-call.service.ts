import { ComponentPortal, DomPortalOutlet } from "@angular/cdk/portal";
import { ApplicationRef, ComponentRef, inject, Injectable, Injector, NgZone } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { lastValueFrom } from "rxjs";
import { VideoCallComponent } from "../../modules/shared/partials/shared/video-call/video-call.component";
import { VideoCallSocketService, VideoRoleType } from "./socket-service/video-socket.service";
import { IncomingCallFloatingComponent } from "../../modules/shared/partials/shared/video-call/incoming-call-dialog.component";
import { CallEndReason } from "../enums/enums";
import { API_ENV, ICE_SERVERS } from "../../../environments/env";

@Injectable({ providedIn: 'root' })
export class VideoCallService {
  private readonly _appRef = inject(ApplicationRef);
  private readonly _injector = inject(Injector);
  private readonly _zone = inject(NgZone);
  private readonly _http = inject(HttpClient);
  private readonly _videoCallSocketService = inject(VideoCallSocketService);

  private readonly _outlets = new Set<DomPortalOutlet>();
  private _floatingOutlet: DomPortalOutlet | null = null;
  private _callComponentRef?: ComponentRef<VideoCallComponent>;

  private _cachedIceServers?: RTCIceServer[];

  async getIceServers(): Promise<RTCIceServer[]> {
    if (this._cachedIceServers) return this._cachedIceServers;

    try {
      const res = await lastValueFrom(this._http.post<{ iceServers: RTCIceServer[] }>(
        `${API_ENV.videoCall}/turn-credentials`,
        {},
        { withCredentials: true },
      ));
      this._cachedIceServers = res.iceServers?.length ? res.iceServers : ICE_SERVERS;
    } catch (e) {
      console.warn('[VideoCall] Failed to fetch TURN credentials, using STUN only', e);
      this._cachedIceServers = ICE_SERVERS;
    }
    return this._cachedIceServers;
  }

  showIncomingFloating(callerId: string) {
    this._zone.run(() => {
      const element = document.querySelector('#video-call-root') as HTMLElement | null;
      if (!element) {
        console.error('❌ #video-call-root not found in DOM');
        return;
      }

      this._detachFloating();

      const outlet = this._createOutlet(element);
      this._floatingOutlet = outlet;

      const floatingPortal = new ComponentPortal(IncomingCallFloatingComponent, null, this._injector);
      const componentRef = outlet.attach(floatingPortal);

      componentRef.instance.callerId = callerId;

      componentRef.instance.accept.subscribe(() => {
        const callId = this._videoCallSocketService.callId();
        if (!callId) return;

        console.log('✅ Call accepted:', callerId);
        this._videoCallSocketService.acceptCall(callId);
        this._detachFloating();
        this.startCall(callerId, 'callee');
      });

      componentRef.instance.decline.subscribe(() => {
        const callId = this._videoCallSocketService.callId();
        console.log('❌ Call declined by user');
        if (callId) {
          this._videoCallSocketService.declineCall(callId);
        }
        this._detachFloating();
      });
    });
  }

  startCall(partnerId: string, role: VideoRoleType = 'caller') {
    const element = document.querySelector('#video-call-root') as HTMLElement | null;
    if (!element) {
      console.error('❌ #video-call-root not found in DOM');
      return;
    }

    this._detachAll();

    this._videoCallSocketService.partnerId = partnerId;

    const outlet = this._createOutlet(element);
    const portal = new ComponentPortal(VideoCallComponent, null, this._injector);
    const componentRef = outlet.attach(portal);
    this._callComponentRef = componentRef;

    (componentRef.instance as any).role = role;
    (componentRef.instance as any).partnerId = partnerId;

    if (role === 'caller') {
      this._videoCallSocketService.startCall(partnerId);
    }
  }

  /** React to a server-driven call end (missed, declined, cancelled, remote left, etc). */
  handleEnd(reason: CallEndReason) {
    this._zone.run(() => {
      if (this._callComponentRef) {
        this._callComponentRef.instance.showEndReason(reason);
      } else {
        this._detachAll();
      }
    });
  }

  /** Fully detach every open call UI (after the end reason has been shown). */
  endCall() {
    this._detachAll();
  }

  private _createOutlet(element: HTMLElement): DomPortalOutlet {
    const outlet = new DomPortalOutlet(element, this._injector, this._appRef);
    this._outlets.add(outlet);
    return outlet;
  }

  private _detachOutlet(outlet: DomPortalOutlet | null) {
    if (!outlet) return;
    outlet.detach();
    this._outlets.delete(outlet);
  }

  private _detachFloating() {
    this._detachOutlet(this._floatingOutlet);
    this._floatingOutlet = null;
  }

  private _detachAll() {
    this._detachOutlet(this._floatingOutlet);
    this._floatingOutlet = null;
    for (const outlet of this._outlets) {
      outlet.detach();
    }
    this._outlets.clear();
    this._callComponentRef = undefined;
  }
}
