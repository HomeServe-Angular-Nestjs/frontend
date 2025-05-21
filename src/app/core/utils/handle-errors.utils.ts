import { HttpErrorResponse } from "@angular/common/http";
import { NotificationService } from "../services/public/notification.service";
import { of } from "rxjs";
import { Store } from "@ngrx/store";
import { authActions } from "../../store/auth/auth.actions";

export function handleApiError(
    error: HttpErrorResponse,
    fallbackAction: (payload: { error: string }) => any,
    notyf: NotificationService,
    store?: Store,
) {
    console.error('[API Error]', error);

    if (error?.status === 401 && store) {
        store.dispatch(authActions.logout({ userType: "admin" }));
    }

    const errorMessage = error?.error?.message || error.message || 'Something went wrong. Please try again!';
    notyf.error(errorMessage);
    return of(fallbackAction({ error: errorMessage }));
};
