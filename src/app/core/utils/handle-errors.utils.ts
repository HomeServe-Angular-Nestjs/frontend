import { HttpErrorResponse } from "@angular/common/http";
import { NotificationService } from "../services/public/notification.service";
import { of } from "rxjs";

export function handleApiError(
    error: HttpErrorResponse,
    fallbackAction: (payload: { error: string }) => any,
    notyf: NotificationService
) {
    console.error('[API Error]', error);
    const errorMessage = error?.error?.message || error.message || 'Something went wrong. Please try again!';
    notyf.error(errorMessage);
    return of(fallbackAction({ error: errorMessage }));
}