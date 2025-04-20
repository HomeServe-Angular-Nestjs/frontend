import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { BehaviorSubject, catchError, throwError } from "rxjs";
import { IUser } from "../../modules/shared/models/user.model";

@Injectable({ providedIn: "root" })
export class SignupAuthService {
    private apiUrl = API_ENV.signupAuth;
    private currentStep = new BehaviorSubject<number>(1);
    currentStep$ = this.currentStep.asObservable();

    constructor(private http: HttpClient) { }

    initiateSignup(email: string, type: string) {
        return this.http.post(`${this.apiUrl}/initiate_signup`, { email, type }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    verifyOtp(email: string, code: string) {
        return this.http.post(`${this.apiUrl}/verify_otp`, { email, code }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    completeOtp(user: IUser) {
        return this.http.post(`${this.apiUrl}/complete_signup`, user).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        )
    }

    private getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || 'something went wrong';
    }
}