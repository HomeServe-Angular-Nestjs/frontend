import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { API_ENV } from "../../../../environments/env";

@Injectable()
export class OtpService {
    private _http = inject(HttpClient);

    private readonly _apiUrl = API_ENV.customer;

    sendOtpToPhone(phone: number): Observable<boolean> {
        return this._http.post<boolean>(`${this._apiUrl}/send_otp_sms`, { phone }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    /**
     * Extracts a readable error message from an HTTP error.
     * @param error - The HTTP error response.
     * @returns A user-friendly error message.
     */
    private getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || 'something went wrong';
    }
}