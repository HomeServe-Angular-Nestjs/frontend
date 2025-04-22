import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap } from "rxjs";
import { providerActions } from "./provider.action";
import { ProviderService } from "../../core/services/provider.service";
import { Router } from "@angular/router";

export const providerEffects = {
    fetchOneProvider$: createEffect(() => {
        const actions$ = inject(Actions);
        const providerService = inject(ProviderService);

        return actions$.pipe(
            ofType(providerActions.fetchOneProvider),
            switchMap(() =>
                providerService.getOneProvider().pipe(
                    map((provider) => providerActions.fetchOneProviderSuccess({ provider })),
                    catchError((error) => {
                        console.log('[Fetch Users Effect] API Error: ', error);
                        const errorMessage = error?.error?.message || "Something went wrong. Please try again!";
                        return of(providerActions.fetchOneProviderFailure({ error: errorMessage }));
                    })
                )
            )
        );

    }, { functional: true }),

    updateProvider$: createEffect(() => {
        const actions$ = inject(Actions);
        const providerService = inject(ProviderService);
        const router = inject(Router);

        return actions$.pipe(
            ofType(providerActions.updateProvider),
            switchMap(({ updateProviderData }) =>
                providerService.updateProviderData(updateProviderData).pipe(
                    map((updatedProviderData) => {
                        router.navigate(['provider', 'profiles', 'overview']);
                        return providerActions.updateProviderSuccess({ updatedProviderData });
                    }),
                    catchError((error) => {
                        console.log('[Fetch Users Effect] API Error: ', error);
                        const errorMessage = error?.error?.message || "Something went wrong. Please try again!";
                        return of(providerActions.fetchOneProviderFailure({ error: errorMessage }));
                    })
                )
            )
        );
    }, { functional: true })
}