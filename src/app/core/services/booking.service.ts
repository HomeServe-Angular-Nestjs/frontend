import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { catchError, Observable, throwError } from "rxjs";
import { IPriceBreakup, IPriceBreakupData } from "../models/booking.model";

@Injectable()
export class CustomerBookingService {
    private _http = inject(HttpClient);

    private _apiUrl = API_ENV.customer;

    fetchPriceBreakup(data: IPriceBreakup[]): Observable<IPriceBreakupData> {
        return this._http.post<IPriceBreakupData>(`${this._apiUrl}/booking/price_breakup`, data).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    private getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || error?.message || 'something went wrong';
    }
}