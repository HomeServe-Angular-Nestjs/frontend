import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";
import { API_ENV } from "../../../environments/env";
import { IBookingPerformanceData, IProviderPerformanceOverview, IReviewChartData } from "../models/analytics.model";

@Injectable()
export class AnalyticService {
    private readonly _http = inject(HttpClient);
    private readonly _apiUrl = API_ENV.analytics;

    getPerformanceSummary(): Observable<IResponse<IProviderPerformanceOverview>> {
        return this._http.get<IResponse<IProviderPerformanceOverview>>(`${this._apiUrl}/performance_summary`)
    }

    getPerformanceBookingOverview(): Observable<IResponse<IBookingPerformanceData[]>> {
        return this._http.get<IResponse<IBookingPerformanceData[]>>(`${this._apiUrl}/booking_overview`);
    }

    getPerformanceRatingTrends(): Observable<IResponse<IReviewChartData>> {
        return this._http.get<IResponse<IReviewChartData>>(`${this._apiUrl}/rating_trends`);
    }
}