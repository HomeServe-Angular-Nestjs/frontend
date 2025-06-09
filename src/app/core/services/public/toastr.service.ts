import { inject, Injectable } from "@angular/core";
import { ActiveToast, IndividualConfig, ToastrService } from "ngx-toastr";

@Injectable({ providedIn: "root" })
export class ToastNotificationService {
    private _toastr = inject(ToastrService);

    private _deafultConfig: Partial<IndividualConfig> = {
        positionClass: 'toast-top-offset',
        toastClass: 'ngx-toastr toast-custom',
        timeOut: 3000,
        progressBar: true,
    };

    success(message: string, title: string = 'Success', config?: Partial<IndividualConfig>): ActiveToast<any> {
        return this._toastr.success(message, title, { ...this._deafultConfig, ...config });
    }

    error(message: string, title: string = 'Error', config?: Partial<IndividualConfig>): ActiveToast<any> {
        return this._toastr.error(message, title, { ...this._deafultConfig, ...config });
    }

    info(message: string, title: string = 'Info', config?: Partial<IndividualConfig>): ActiveToast<any> {
        return this._toastr.info(message, title, { ...this._deafultConfig, ...config });
    }

    warning(message: string, title: string = 'Warning', config?: Partial<IndividualConfig>): ActiveToast<any> {
        return this._toastr.warning(message, title, { ...this._deafultConfig, ...config });
    }

    custom(message: string, title: string, config?: Partial<IndividualConfig>): ActiveToast<any> {
        return this._toastr.show(message, title, { ...this._deafultConfig, ...config });
    }
} 