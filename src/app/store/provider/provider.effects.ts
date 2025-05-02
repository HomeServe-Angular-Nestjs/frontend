import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap, tap } from "rxjs";
import { providerActions } from "./provider.action";
import { ProviderService } from "../../core/services/provider.service";
import { Router } from "@angular/router";
import { handleApiError } from "../../core/utils/handle-errors.utils";
import { NotificationService } from "../../core/services/public/notification.service";
import { HttpErrorResponse } from "@angular/common/http";

export const providerEffects = {
    fetchOneProvider$: createEffect(() => {
        const actions$ = inject(Actions);
        const providerService = inject(ProviderService);
        const notyf = inject(NotificationService);

        return actions$.pipe(
            ofType(providerActions.fetchOneProvider),
            switchMap(() =>
                providerService.getOneProvider().pipe(
                    map((provider) => providerActions.fetchOneProviderSuccess({ provider })),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, providerActions.fetchOneProviderFailure, notyf);
                    })
                )
            )
        );
    }, { functional: true }),

    updateProvider$: createEffect(() => {
        const actions$ = inject(Actions);
        const providerService = inject(ProviderService);
        const router = inject(Router);
        const notyf = inject(NotificationService);

        return actions$.pipe(
            ofType(providerActions.updateProvider),
            switchMap(({ updateProviderData }) =>
                providerService.updateProviderData(updateProviderData).pipe(
                    map((updatedProviderData) => {
                        router.navigate(['provider', 'profiles', 'overview']);
                        notyf.success('profile updated successfully');
                        return providerActions.updateProviderSuccess({ updatedProviderData });
                    }),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, providerActions.updateProviderFailure, notyf);
                    })
                )
            )
        );
    }, { functional: true })
}