import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";
import { API_ENV } from "../../../environments/env";
import { IBookingPerformanceData, IOnTimeArrivalChartData, IProviderPerformanceOverview, IResponseTimeChartData, IReviewChartData } from "../models/analytics.model";

@Injectable()
export class AnalyticService {
    private readonly _http = inject(HttpClient);
    private readonly _apiUrl = API_ENV.analytics;

    getPerformanceSummary(): Observable<IResponse<IProviderPerformanceOverview>> {
        return this._http.get<IResponse<IProviderPerformanceOverview>>(`${this._apiUrl}/performance/summary`)
    }

    getPerformanceBookingOverview(): Observable<IResponse<IBookingPerformanceData[]>> {
        return this._http.get<IResponse<IBookingPerformanceData[]>>(`${this._apiUrl}/performance/booking_overview`);
    }

    getPerformanceRatingTrends(): Observable<IResponse<IReviewChartData>> {
        return this._http.get<IResponse<IReviewChartData>>(`${this._apiUrl}/performance/rating_trends`);
    }

    getResponseTimeDistributionData(): Observable<IResponse<IResponseTimeChartData[]>> {
        return this._http.get<IResponse<IResponseTimeChartData[]>>(`${this._apiUrl}/performance/response_time`);
    }

    getOnTimeArrivalData(): Observable<IResponse<IOnTimeArrivalChartData[]>> {
        return this._http.get<IResponse<IOnTimeArrivalChartData[]>>(`${this._apiUrl}/performance/on_time_arrival`);
    }
}