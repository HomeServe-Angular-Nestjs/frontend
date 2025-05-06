import { inject, Injectable } from "@angular/core";
import { IUser, UserType } from "../../modules/shared/models/user.model";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { API_ENV } from "../../environments/api.environments";
import { catchError, map, Observable, tap, throwError } from "rxjs";
import { IResponse, IVerifyTokenResponse } from "../../modules/shared/models/response.model";
import { Store } from "@ngrx/store";


@Injectable({ providedIn: "root" })
export class LoginAuthService {
    private apiUrl = API_ENV.loginAuth;
    private store = inject(Store)

    constructor(private http: HttpClient) { }

    authCredentials(user: IUser) {
        return this.http.post(`${this.apiUrl}/auth`, user).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            ));
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

    logout(userType: UserType): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/logout`, { userType }).pipe(
            catchError((error: HttpErrorResponse) => {
                const message = error?.error?.message || 'Something went wrong';
                return throwError(() => new Error(message));
            })
        );
    }

    private getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || 'something went wrong';
    }
}