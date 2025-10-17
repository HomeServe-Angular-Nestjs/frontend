import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, of } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";
import { API_ENV } from "../../../environments/env";
import { IBookingPerformanceData, IComparisonChartData, IComparisonOverviewData, IRevenueCompositionData, IDisputeAnalyticsChartData, IOnTimeArrivalChartData, IProviderPerformanceOverview, IProviderRevenueOverview, IResponseTimeChartData, IRevenueMonthlyGrowthRateData, IRevenueTrendData, IReviewChartData, RevenueChartView, ITopServicesByRevenue, INewOrReturningClientData } from "../models/analytics.model";

@Injectable()
export class AnalyticService {
    private readonly _http = inject(HttpClient);
    private readonly _apiUrl = API_ENV.analytics;

    // ------------ Performance Analytics APIs ------------

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

    getMonthlyDisputeStats(): Observable<IResponse<IDisputeAnalyticsChartData[]>> {
        return this._http.get<IResponse<IDisputeAnalyticsChartData[]>>(`${this._apiUrl}/performance/monthly_disputes`);
    }

    getComparisonOverviewData(): Observable<IResponse<IComparisonOverviewData>> {
        return this._http.get<IResponse<IComparisonOverviewData>>(`${this._apiUrl}/performance/comparison_overview`);
    }

    getComparisonStats(): Observable<IResponse<IComparisonChartData[]>> {
        return this._http.get<IResponse<IComparisonChartData[]>>(`${this._apiUrl}/performance/comparison_stats`);
    }

    // ------------ Revenue Analytics APIs ------------

    getRevenueOverview(): Observable<IResponse<IProviderRevenueOverview>> {
        return this._http.get<IResponse<IProviderRevenueOverview>>(`${this._apiUrl}/revenue/overview`);
    }

    getRevenueTrendOverTime(view: RevenueChartView = 'monthly'): Observable<IResponse<IRevenueTrendData>> {
        const params = new HttpParams().set('view', view);
        return this._http.get<IResponse<IRevenueTrendData>>(`${this._apiUrl}/revenue/trends`, { params });
    }

    getMonthlyRevenueGrowthRate(): Observable<IResponse<IRevenueMonthlyGrowthRateData[]>> {
        return this._http.get<IResponse<IRevenueMonthlyGrowthRateData[]>>(`${this._apiUrl}/revenue/growth_rate`);
    }

    getRevenueCompositionChartData(): Observable<IResponse<IRevenueCompositionData[]>> {
        return this._http.get<IResponse<IRevenueCompositionData[]>>(`${this._apiUrl}/revenue/composition`);
    }

    getTopServicesByRevenue(): Observable<IResponse<ITopServicesByRevenue[]>> {
        return this._http.get<IResponse<ITopServicesByRevenue[]>>(`${this._apiUrl}/revenue/top_services`);
    }

    getNewAndReturningClientData(): Observable<IResponse<INewOrReturningClientData[]>> {
        return this._http.get<IResponse<INewOrReturningClientData[]>>(`${this._apiUrl}/revenue/new_returning_clients`);
    }

    // ----------------- Area Analytics APIs --------------
    getServiceDemandHeatmapData():any {
        // Replace this mock with an HTTP request to your backend
        return of([
            { day: 'Mon', hour: '06:00', count: 5 },
            { day: 'Mon', hour: '07:00', count: 12 },
            { day: 'Tue', hour: '10:00', count: 18 },
            { day: 'Fri', hour: '10:00', count: 44 },
            { day: 'Sat', hour: '11:00', count: 61 },
            { day: 'Sun', hour: '12:00', count: 73 },
            // ...more data
        ]);
        return this._http.get<IResponse<INewOrReturningClientData[]>>(`${this._apiUrl}/revenue/new_returning_clients`);
    }

    getRevenueByLocationData(): any {
        // Coordinates: [longitude, latitude]
        return of([
            { city: 'Kochi', coord: [76.2673, 9.9312], value: 420000 },
            { city: 'Trivandrum', coord: [76.9366, 8.5241], value: 310000 },
            { city: 'Calicut', coord: [75.7804, 11.2588], value: 185000 },
            { city: 'Bangalore', coord: [77.5946, 12.9716], value: 240000 },
            { city: 'Chennai', coord: [80.2707, 13.0827], value: 275000 }
        ]);
    }

    getServiceDemandByLocation(): any {
        return of([
            { location: 'Thiruvananthapuram', demand: 120, revenue: 5000 },
            { location: 'Kochi', demand: 95, revenue: 4000 },
            { location: 'Kozhikode', demand: 80, revenue: 3500 },
            { location: 'Alappuzha', demand: 60, revenue: 2500 },
            { location: 'Thrissur', demand: 70, revenue: 3000 },
            { location: 'Kannur', demand: 50, revenue: 2000 },
            { location: 'Kollam', demand: 40, revenue: 1800 },
            { location: 'Palakkad', demand: 55, revenue: 2200 }
        ]);
    }
}