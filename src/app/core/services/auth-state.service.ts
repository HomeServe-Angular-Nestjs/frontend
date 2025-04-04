import { inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { authActions } from "../../store/actions/auth.actions";
import { AuthState } from "../../store/models/auth.model";

@Injectable({ providedIn: "root" })
export class AuthStateService {
    private route = inject(ActivatedRoute);
    private store = inject(Store);
    private router = inject(Router);

    initializeAuthState() {
        this.route.queryParams.subscribe(params => {
            const email = params['email'];
            const type = params['type'];

            if (email && type) {
                this.store.dispatch(authActions.loginSuccess({ user: { email, type } }));
                this.router.navigate([], { queryParams: {}, replaceUrl: true });
            }
        });

        const authState = localStorage.getItem('auth');
        if (authState) {
            const parsedAuthState = JSON.parse(authState) as AuthState;
            if (parsedAuthState.status === 'authenticated' && parsedAuthState.user) {
                this.store.dispatch(authActions.loginSuccess({ user: parsedAuthState.user }));
            }
        }
    }
}