import { inject, Injectable } from "@angular/core";
import { IUser } from "../../modules/shared/models/user.model";
import { HttpClient } from "@angular/common/http";
import { API_ENV } from "../../../environments/env";
import { Observable } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";


@Injectable({ providedIn: "root" })
export class LoginAuthService {
    private readonly _http = inject(HttpClient);
    private readonly _apiUrl = API_ENV.loginAuth;

    authCredentials(user: IUser) {
        return this._http.post(`${this._apiUrl}/auth`, user);
    }

    requestOtpForForgotPass(user: IUser) {
        return this._http.post(`${this._apiUrl}/otp_forgot_password`, user);
    }

    verifyOtpForForgotPass(email: string, code: string) {
        return this._http.post(`${this._apiUrl}/verify_otp_forgot`, { email, code });
    }

    changePassword(email: string, password: string, type: string) {
        return this._http.put(`${this._apiUrl}/change_password`, { email, password, type });
    }

    initializeGoogleAuth(type: string) {
        return this._http.get<IResponse>(`${this._apiUrl}/google/init?type=${type}`);
    }

    logout(): Observable<void> {
        return this._http.post<void>(`${this._apiUrl}/logout`, {});
    }
}