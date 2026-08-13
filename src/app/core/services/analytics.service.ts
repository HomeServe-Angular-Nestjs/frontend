import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";
import { API_ENV } from "../../../environments/env";
import { IPerformanceAnalyticsBundle, IRevenueAnalyticsBundle, IAreaAnalyticsBundle, IRevenueTrendData, RevenueChartView } from "../models/analytics.model";

@Injectable({ providedIn: 'root' })
export class AnalyticService {
    private readonly _http = inject(HttpClient);
    private readonly _apiUrl = API_ENV.analytics;

    getPerformanceBundle(): Observable<IResponse<IPerformanceAnalyticsBundle>> {
        return this._http.get<IResponse<IPerformanceAnalyticsBundle>>(`${this._apiUrl}/performance`)
    }

    getRevenueBundle(view: RevenueChartView = 'monthly'): Observable<IResponse<IRevenueAnalyticsBundle>> {
        const params = new HttpParams().set('view', view);
        return this._http.get<IResponse<IRevenueAnalyticsBundle>>(`${this._apiUrl}/revenue`, { params });
    }

    getRevenueTrend(view: RevenueChartView = 'monthly'): Observable<IResponse<IRevenueTrendData>> {
        const params = new HttpParams().set('view', view);
        return this._http.get<IResponse<IRevenueTrendData>>(`${this._apiUrl}/revenue/trend`, { params });
    }

    getAreaBundle(): Observable<IResponse<IAreaAnalyticsBundle>> {
        return this._http.get<IResponse<IAreaAnalyticsBundle>>(`${this._apiUrl}/area`)
    }
}
