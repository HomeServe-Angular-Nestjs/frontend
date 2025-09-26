import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { catchError, map, Observable, throwError } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";
import { ICreateSubscription, ISubscription, IUpdateSubscriptionPaymentStatus } from "../models/subscription.model";
import { Store } from "@ngrx/store";

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
    private readonly _http = inject(HttpClient);

    private readonly _apiUrl = API_ENV.subscription;

    createSubscription(data: ICreateSubscription): Observable<IResponse<ISubscription>> {
        return this._http.post<IResponse<ISubscription>>(`${this._apiUrl}`, data);
    }

    getUpgradeAmount(subscriptionId: string): Observable<IResponse<number>> {
        return this._http.get<IResponse<number>>(`${this._apiUrl}/upgrade_amount/${subscriptionId}`);
    }

    upgradeSubscription(data: ICreateSubscription): Observable<IResponse<ISubscription>> {
        return this._http.post<IResponse<ISubscription>>(`${this._apiUrl}/upgrade`, { data });
    }

    fetchSubscription(): Observable<IResponse<ISubscription | null>> {
        return this._http.get<IResponse<ISubscription>>(`${this._apiUrl}`);
    }

    updatePaymentStatus(data: IUpdateSubscriptionPaymentStatus): Observable<IResponse> {
        return this._http.patch<IResponse<boolean>>(`${this._apiUrl}/payment_status`, data);
    }
}