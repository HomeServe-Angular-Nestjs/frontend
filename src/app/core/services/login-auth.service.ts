import { inject, Injectable } from "@angular/core";
import { IUser, UserType } from "../../modules/shared/models/user.model";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { API_ENV } from "../../environments/api.environments";
import { catchError, map, Observable, tap, throwError } from "rxjs";
import { IResponse, IVerifyTokenResponse } from "../../modules/shared/models/response.model";
import { Store } from "@ngrx/store";
import { AuthState } from "../../store/models/auth.model";


@Injectable({ providedIn: "root" })
export class LoginAuthService {
    private apiUrl = API_ENV.loginAuth;
    private store = inject(Store)

    constructor(private http: HttpClient) { }

    authCredentials(user: IUser) {
        console.log('[Login Service] logging the params: ', user);
        return this.http.post(`${this.apiUrl}/auth`, user).pipe(
            tap((response) => console.log(response))
        );
    }

    forgotPassword(user: IUser) {
        return this.http.post(`${this.apiUrl}/forgot_password`, user, { withCredentials: true });
    }

    verifyToken(token: string) {
        return this.http.post<IVerifyTokenResponse>(`${this.apiUrl}/verify_token`, { token });
    }

    changePassword(user: IUser) {
        return this.http.put(`${this.apiUrl}/change_password`, user);
    }

    initializeGoogleAuth(type: string) {
        return this.http.get<IResponse>(`${this.apiUrl}/google/init?type=${type}`);
    }

    logout(userType: UserType) {
        return this.http.post(`${this.apiUrl}/logout`, { userType }, { withCredentials: true });
    }
}