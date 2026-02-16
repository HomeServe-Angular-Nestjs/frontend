import { HttpErrorResponse } from "@angular/common/http";
import { of } from "rxjs";
import { ToastNotificationService } from "../services/public/toastr.service";

export function handleApiError(
    error: HttpErrorResponse,
    fallbackAction: (payload: { error: any }) => any,
    toastr: ToastNotificationService,
) {
    const errorDetails = error?.error || { message: error.message };
    const toastMessage = typeof errorDetails === 'string'
        ? errorDetails
        : errorDetails?.message || 'Something went wrong. Please try again!';

    toastr.error(toastMessage);

    return of(fallbackAction({ error: errorDetails }));
}
