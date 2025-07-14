import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { SubscriptionService } from "../../core/services/subscription.service";
import { ToastNotificationService } from "../../core/services/public/toastr.service";
import { subscriptionAction } from "./subscription.action";
import { catchError, map, switchMap } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { handleApiError } from "../../core/utils/handle-errors.utils";
import { IResponse } from "../../modules/shared/models/response.model";

export const subscriptionEffects = {
    fetchSubscription$: createEffect(() => {
        const actions$ = inject(Actions);
        const subscriptionService = inject(SubscriptionService);
        const toastr = inject(ToastNotificationService);

        return actions$.pipe(
            ofType(subscriptionAction.fetchSubscriptions),
            switchMap(() =>
                subscriptionService.fetchSubscription().pipe(
                    map((response) => {
                        return subscriptionAction.subscriptionSuccessAction({ selectedSubscription: response.data || null });
                    }),
                    catchError((error: HttpErrorResponse) => {
                        return handleApiError(error, subscriptionAction.subscriptionFailedAction, toastr)
                    })
                )
            )
        );
    }, { functional: true })
}