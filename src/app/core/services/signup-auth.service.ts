import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { IUser } from "../../modules/shared/models/user.model";

@Injectable()
export class SignupAuthService {
    private readonly _http = inject(HttpClient);
    private readonly _apiUrl = API_ENV.signupAuth;

    initiateSignup(email: string, type: string) {
        return this._http.post(`${this._apiUrl}/initiate_signup`, { email, type });
    }

    verifyOtp(data: IUser & { code: string }) {
        return this._http.post<void>(`${this._apiUrl}/verify_otp`, data);
    }
}