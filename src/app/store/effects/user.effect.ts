import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { UserManagementService } from "../../core/services/user.service";
import { userActions } from "../actions/user.actions";
import { catchError, map, of, switchMap, tap, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { NotificationService } from "../../core/services/public/notification.service";

export const userEffects = {
    fetchUsers$: createEffect(() => {
        const actions$ = inject(Actions);
        const userService = inject(UserManagementService);
        const notyf = inject(NotificationService);

        return actions$.pipe(
            ofType(userActions.fetchUsers),
            switchMap(() =>
                userService.getUsers().pipe(
                    map((response) => userActions.fetchUsersSuccess({ customers: response.customers, providers: response.providers })),
                    catchError((error: HttpErrorResponse) => {
                        console.log('[Fetch Users Effect] API Error: ', error);
                        const errorMessage = error?.error?.message || "Something went wrong. Please try again!";
                        notyf.error(errorMessage);
                        return of(userActions.fetchUsersFailure({ error: errorMessage }));
                    })
                )
            )
        );
    }, { functional: true })
}
