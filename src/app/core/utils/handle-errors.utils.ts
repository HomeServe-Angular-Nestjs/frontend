import { HttpErrorResponse } from "@angular/common/http";
import { of } from "rxjs";
import { ToastNotificationService } from "../services/public/toastr.service";

export function handleApiError(
    error: HttpErrorResponse,
    fallbackAction: (payload: { error: string }) => any,
    toastr: ToastNotificationService,
) {
    const errorMessage = error?.error || error?.error?.message || error.message || 'Something went wrong. Please try again!';
    toastr.error(errorMessage);
    return of(fallbackAction({ error: errorMessage }));
};
