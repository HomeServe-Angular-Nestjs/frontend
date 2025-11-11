import { ComponentPortal, DomPortalOutlet } from "@angular/cdk/portal";
import { ApplicationRef, inject, Injectable, Injector, NgZone, signal } from "@angular/core";
import { VideoCallComponent } from "../../modules/shared/partials/shared/video-call/video-call.component";
import { VideoCallSocketService, VideoRoleType } from "./socket-service/video-socket.service";
import { IncomingCallFloatingComponent } from "../../modules/shared/partials/shared/video-call/incoming-call-dialog.component";

@Injectable({ providedIn: 'root' })
export class VideoCallService {
  private readonly _appRef = inject(ApplicationRef);
  private readonly _injector = inject(Injector);
  private readonly _zone = inject(NgZone);
  private readonly _videoCallSocketService = inject(VideoCallSocketService);

  private _portalHost!: DomPortalOutlet;
  private _floatingPortal!: DomPortalOutlet;

  readonly incomingCall = signal<{ callerId: string } | null>(null);

  showIncomingFloating(callerId: string) {
    this._zone.run(() => {
      const element = document.querySelector('#video-call-root');
      if (!element) {
        console.error('❌ #video-call-root not found in DOM');
        return;
      }

      this._floatingPortal?.detach();

      this._floatingPortal = new DomPortalOutlet(
        element,
        this._injector,
        this._appRef
      );

      const floatingPortal = new ComponentPortal(IncomingCallFloatingComponent, null, this._injector);
      const componentRef = this._floatingPortal.attach(floatingPortal);

      componentRef.instance.callerId = callerId;

      componentRef.instance.accept.subscribe(() => {
        console.log('✅ Call accepted:', callerId);
        // set partnerId early and notify server
        this._videoCallSocketService.partnerId = callerId;
        this._videoCallSocketService.acceptCall(callerId);

        this._floatingPortal?.detach();
        // start call UI as callee
        this.startCall(callerId, 'callee');
      });

      componentRef.instance.decline.subscribe(() => {
        console.log('❌ Call declined by user');
        this._floatingPortal?.detach();
      });
    });
  }

  startCall(partnerId: string, role: VideoRoleType = 'caller') {
    const element = document.querySelector('#video-call-root');
    if (!element) {
      console.error('❌ #video-call-root not found in DOM');
      return;
    }

    this._floatingPortal?.detach();

    this._videoCallSocketService.partnerId = partnerId;

    this._portalHost = new DomPortalOutlet(
      element,
      this._injector,
      this._appRef
    );

    const portal = new ComponentPortal(VideoCallComponent, null, this._injector);
    const componentRef = this._portalHost.attach(portal);

    (componentRef.instance as any).role = role;
    (componentRef.instance as any).partnerId = partnerId;

    if (role === 'caller') {
      this._videoCallSocketService.startCall(partnerId);
    }
  }

  declineCall() {
    this.incomingCall.set(null);
  }

  endCall() {
    this._portalHost?.detach();
  }
}
