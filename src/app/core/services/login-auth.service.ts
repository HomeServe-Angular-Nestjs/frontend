import { Injectable } from "@angular/core";
import { IUser } from "../../modules/shared/models/user.model";
import { HttpClient } from "@angular/common/http";
import { API_ENV } from "../../environments/api.environments";
import { Observable } from "rxjs";
import { IVerifyTokenResponse } from "../../modules/shared/models/response.model";


@Injectable({ providedIn: "root" })
export class LoginAuthService {
    private apiUrl = API_ENV.loginAuth;

    constructor(private http: HttpClient) { }

    authCredentials(user: IUser) {
        return this.http.post(`${this.apiUrl}/auth`, user);
    }

    forgotPassword(user: IUser) {
        return this.http.post(`${this.apiUrl}/forgot_password`, user);
    }

    verifyToken(token: string) {
        return this.http.post<IVerifyTokenResponse>(`${this.apiUrl}/verify_token`, { token });
    }

    changePassword(user: IUser) {
        return this.http.put(`${this.apiUrl}/change_password`, user);
    }
}