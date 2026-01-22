import { inject, Injectable } from "@angular/core";
import { ActiveToast, IndividualConfig, ToastrService } from "ngx-toastr";

@Injectable({ providedIn: "root" })
export class ToastNotificationService {
    private _toastr = inject(ToastrService);

    toasterClass = 'toast-customer-custom';

    constructor() {
        const url = window.location.href.split('/');
        this.toasterClass = url.includes('provider') ? 'toast-provider-custom' : 'toast-customer-custom';
    }

    private _defaultConfig: Partial<IndividualConfig> = {
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
        progressBar: true,
    };

    private getToastClass(): string {
        return `ngx-toastr ${this.toasterClass}`;
    }

    success(message: string, title: string = 'Success', config?: Partial<IndividualConfig>): ActiveToast<any> {
        return this._toastr.success(message, title, { ...this._defaultConfig, ...config, toastClass: this.getToastClass() });
    }

    error(message: string, title: string = 'Error', config?: Partial<IndividualConfig>): ActiveToast<any> {
        return this._toastr.error(message, title, { ...this._defaultConfig, ...config, toastClass: this.getToastClass() });
    }

    info(message: string, title: string = 'Info', config?: Partial<IndividualConfig>): ActiveToast<any> {
        return this._toastr.info(message, title, { ...this._defaultConfig, ...config, toastClass: this.getToastClass() });
    }

    warning(message: string, title: string = 'Warning', config?: Partial<IndividualConfig>): ActiveToast<any> {
        return this._toastr.warning(message, title, { ...this._defaultConfig, ...config, toastClass: this.getToastClass() });
    }

    custom(message: string, title: string, config?: Partial<IndividualConfig>): ActiveToast<any> {
        return this._toastr.show(message, title, { ...this._defaultConfig, ...config, toastClass: this.getToastClass() });
    }
} 