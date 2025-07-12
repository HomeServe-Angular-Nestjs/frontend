import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/env";
import { catchError, Observable, throwError } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";
import { ICreateSubscription, ISubscription } from "../models/subscription.model";

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
    private readonly _http = inject(HttpClient);

    private readonly _apiUrl = API_ENV.subscription;

    private _getErrorMessage(error: HttpErrorResponse): string {
        if (error.error?.message) return error.error.message;
        if (typeof error.error === 'string') return error.error;
        return error.message || 'Something went wrong. Please try again!';
    }

    createSubscription(data: ICreateSubscription): Observable<IResponse<ISubscription>> {
        return this._http.post<IResponse<ISubscription>>(`${this._apiUrl}`, data).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this._getErrorMessage(error)))
            )
        );
    }

}