import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { catchError, map, Observable, throwError } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";
import { IAdminFilteredSubscriptionListWithPagination, IAdminSubscriptionList, ICreateSubscription, ISubscription, ISubscriptionFilters, IUpdateSubscriptionPaymentStatus } from "../models/subscription.model";
import { Store } from "@ngrx/store";

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
    private readonly _http = inject(HttpClient);

    private readonly _apiUrl = API_ENV.subscription;

    private subscription = signal<ISubscription | null>(null);
    private isAlreadyCheckedForSubs = false;

    get getSubscription() {
        return this.subscription();
    }

    set setSubscription(subscription: ISubscription | null) {
        this.subscription.set(subscription);
    }

    get isAlreadyCheckedForSubscription() {
        return this.isAlreadyCheckedForSubs;
    }

    set setIsAlreadyCheckedForSubscription(value: boolean) {
        this.isAlreadyCheckedForSubs = value;
    }

    createSubscription(data: ICreateSubscription): Observable<IResponse<ISubscription>> {
        return this._http.post<IResponse<ISubscription>>(`${this._apiUrl}`, data);
    }

    getUpgradeAmount(subscriptionId: string): Observable<IResponse<number>> {
        return this._http.get<IResponse<number>>(`${this._apiUrl}/upgrade_amount/${subscriptionId}`);
    }

    upgradeSubscription(data: ICreateSubscription): Observable<IResponse<ISubscription>> {
        return this._http.post<IResponse<ISubscription>>(`${this._apiUrl}/upgrade`, data);
    }

    fetchSubscription(): Observable<IResponse<ISubscription | null>> {
        return this._http.get<IResponse<ISubscription>>(`${this._apiUrl}`);
    }

    fetchSubscriptionLists(filters: ISubscriptionFilters = {}): Observable<IResponse<IAdminFilteredSubscriptionListWithPagination>> {
        let params = new HttpParams();

        for (const [key, value] of Object.entries(filters)) {
            if (value !== null && value !== undefined) {
                params = params.set(key, value);
            }
        }

        return this._http.get<IResponse<IAdminFilteredSubscriptionListWithPagination>>(`${this._apiUrl}/lists`, { params });
    }

    updatePaymentStatus(data: IUpdateSubscriptionPaymentStatus): Observable<IResponse> {
        return this._http.patch<IResponse<boolean>>(`${this._apiUrl}/payment_status`, data);
    }

    removeSubscription(subscriptionId: string): Observable<IResponse> {
        return this._http.delete<IResponse>(`${this._apiUrl}/${subscriptionId}`);
    }

    hasActiveSubscription(): Observable<IResponse<ISubscription>> {
        return this._http.get<IResponse<ISubscription>>(`${this._apiUrl}/has_active_subscription`);
    }

    updateSubscriptionStatus(subscriptionId: string, status: boolean): Observable<IResponse> {
        return this._http.patch<IResponse<boolean>>(`${this._apiUrl}/status/${subscriptionId}`, { status });
    }
}