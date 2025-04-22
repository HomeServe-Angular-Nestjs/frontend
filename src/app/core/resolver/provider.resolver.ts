import { Resolve, Router } from "@angular/router";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { Observable, of, switchMap, take } from "rxjs";
import { selectProvider } from "../../store/provider/provider.selector";
import { providerActions } from "../../store/provider/provider.action";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class ProviderResolver implements Resolve<boolean> {
    constructor(
        private store: Store,
        private actions$: Actions,
        private router: Router
    ) { }

    resolve(): Observable<boolean> {
        return this.store.select(selectProvider).pipe(
            take(1),
            switchMap((provider) => {
                if (!provider) {
                    this.store.dispatch(providerActions.fetchOneProvider());
                }

                return this.actions$.pipe(
                    ofType(
                        providerActions.fetchOneProviderSuccess,
                        providerActions.fetchOneProviderFailure
                    ),
                    take(1),
                    switchMap(({ type }) => {
                        if (type === providerActions.fetchOneProviderFailure.type) {
                            // this.router.navigate(['']),
                            return of(false);
                        }
                        return of(true)
                    })
                );
            })
        );
    }
}