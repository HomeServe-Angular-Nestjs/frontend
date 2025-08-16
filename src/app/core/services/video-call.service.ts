import { ComponentPortal, DomPortalOutlet } from "@angular/cdk/portal";
import { ApplicationRef, inject, Injectable, Injector } from "@angular/core";
import { VideoCallComponent } from "../../modules/shared/partials/shared/video-call/video-call.component";

@Injectable({ providedIn: 'root' })
export class VideoCallService {
    private readonly _appRef = inject(ApplicationRef);
    private readonly _injector = inject(Injector);

    private _portalHost!: DomPortalOutlet;


    startCall() {
        const element = document.querySelector('#video-call-root');
        if (!element) throw new Error('Video call root element not found');

        this._portalHost = new DomPortalOutlet(element, null!, this._appRef, this._injector);
        const portal = new ComponentPortal(VideoCallComponent, null, this._injector);
        this._portalHost.attach(portal);
    }

    endCall() {
        this._portalHost?.detach();
    }
}