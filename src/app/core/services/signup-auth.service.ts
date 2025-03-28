import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { IUser } from "../../modules/shared/models/user.model";

interface IOtpResponse {
    success: boolean,
    message: string
}

@Injectable({ providedIn: "root" })
export class SignupAuthService {
    private apiUrl = API_ENV.signupAuth;
    private currentStep = new BehaviorSubject<number>(1);
    currentStep$ = this.currentStep.asObservable();

    constructor(private http: HttpClient) { }

    initiateSignup(email: string, type: string): Observable<IOtpResponse> {
        return this.http.post<IOtpResponse>(`${this.apiUrl}/initiate_signup`, { email, type })
            .pipe(
                tap(() => this.currentStep.next(2))
            );
    }

    verifyOtp(email: string, code: string): Observable<IOtpResponse> {
        return this.http.post<IOtpResponse>(`${this.apiUrl}/verify_otp`, { email, code })
            .pipe(
                tap(() => this.currentStep.next(3))
            );
    }

    completeOtp(user: IUser) {
        return this.http.post(`${this.apiUrl}/complete_signup`, user);
    }


}