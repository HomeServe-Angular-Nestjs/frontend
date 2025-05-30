import { Injectable } from "@angular/core";
import Swal, { SweetAlertIcon, SweetAlertPosition } from 'sweetalert2'

@Injectable({ providedIn: "root" })
export class AlertService {

    showToast(message: string, icon: SweetAlertIcon, position: SweetAlertPosition = 'top-right', timer: number = 3000,) {
        const Toast = this.prepareToast(position, timer);
        Toast.fire({
            icon,
            title: message
        });
    }

    showAlert(title: string, text: string, icon: SweetAlertIcon) {
        Swal.fire({
            title,
            text,
            icon,
            confirmButtonText: 'OK',
        });
    }

    private prepareToast(pos: SweetAlertPosition, tim: number) {
        return Swal.mixin({
            toast: true,
            position: pos,
            showConfirmButton: false,
            timer: tim,
            timerProgressBar: false,
            didOpen: (toast: any) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
        });
    }
}