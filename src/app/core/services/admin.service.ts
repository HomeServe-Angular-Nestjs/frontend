import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { IAdminDashboardUserStats, IApprovalOverviewData, IApprovalTableDetails, IRemoveData, ITopProviders, IUpdateUserStatus, IUserData, IUserDataWithPagination, UType } from "../models/user.model";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { IFilter } from "../models/filter.model";
import { IResponse } from "../../modules/shared/models/response.model";
import { IAdminBookingDetails, IAdminBookingFilter, IBookingStats, IPaginatedBookingsResponse } from "../models/booking.model";
import { IAdminReviewStats, IReviewFilters, PaginatedReviewResponse } from "../models/reviews.model";
import { IAdminDashboardRevenue, IAdminDashboardSubscription } from "../models/subscription.model";
import { IReportDownloadBookingData, IReportDownloadTransactionData, IReportDownloadUserData } from "../models/admin-report.model";
import { IAdminSettings } from "../models/admin-settings.model";

@Injectable({ providedIn: 'root' })
export class AdminService {
    private _http = inject(HttpClient);

    private readonly _adminUrl = API_ENV.admin;

    private _roleSource = new BehaviorSubject<UType>("customer");
    role$ = this._roleSource.asObservable();

    private _userDataSource = new BehaviorSubject<IUserData[] | null>(null);
    userData$ = this._userDataSource.asObservable();

    get currentRole(): UType {
        return this._roleSource.getValue();
    }

    get users(): IUserData[] | null {
        return this._userDataSource.getValue();
    }

    setRole(role: UType) {
        this._roleSource.next(role);
    }

    setUserData(users: IUserData[]) {
        this._userDataSource.next(users);
    }

    getUsers(role: UType, filter: IFilter, page: number): Observable<IUserDataWithPagination> {
        let params = new HttpParams()
            .set('page', page)
            .set('role', role);

        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params = params.set(key, value);
            }
        });

        return this._http.get<IUserDataWithPagination>(`${this._adminUrl}/users`, { params }).pipe(
            tap(usersData => {
                this._userDataSource.next(usersData.data);
            })
        );
    }

    updateStatus(updateData: Omit<IUpdateUserStatus, 'action'>): Observable<boolean> {
        return this._http.patch<boolean>(`${this._adminUrl}/users/status`, updateData);
    }

    removeUser(removeData: IRemoveData): Observable<boolean> {
        return this._http.patch<boolean>(`${this._adminUrl}/users/remove`, removeData);
    }


    fetchApprovalOverviewDetails(): Observable<IResponse<IApprovalOverviewData>> {
        return this._http.get<IResponse<IApprovalOverviewData>>(`${this._adminUrl}/approvals/overview`);
    }

    fetchApprovalTableData(): Observable<IResponse<IApprovalTableDetails[]>> {
        return this._http.get<IResponse<IApprovalTableDetails[]>>(`${this._adminUrl}/approvals/data`);
    }

    getBookings(filter: IAdminBookingFilter = {}): Observable<IResponse<IPaginatedBookingsResponse>> {
        let params = new HttpParams();
        for (const [key, value] of Object.entries(filter)) {
            if (value != null && value != undefined) {
                params = params.set(key, value);
            }
        }

        return this._http.get<IResponse<IPaginatedBookingsResponse>>(`${this._adminUrl}/bookings`, { params });
    }

    getBookingStats(): Observable<IResponse<IBookingStats>> {
        return this._http.get<IResponse<IBookingStats>>(`${this._adminUrl}/bookings/stats`);
    }

    getReviewData(filter: IReviewFilters): Observable<IResponse<PaginatedReviewResponse>> {
        let params = new HttpParams();

        for (let [key, value] of Object.entries(filter)) {
            if (value !== undefined && value !== null) {
                params = params.set(key, value ?? 1);
            }
        }

        return this._http.get<IResponse<PaginatedReviewResponse>>(`${this._adminUrl}/reviews`, { params });
    }

    getReviewStats(): Observable<IResponse<IAdminReviewStats>> {
        return this._http.get<IResponse<IAdminReviewStats>>(`${this._adminUrl}/reviews/stats`);
    }

    updateReviewStatus(data: { reviewId: string, providerId: string, status: boolean }): Observable<IResponse> {

        return this._http.patch<IResponse>(`${this._adminUrl}/reviews/status`, data);
    }

    getDashboardOverviewData(): Observable<IResponse> {
        return this._http.get<IResponse>(`${this._adminUrl}/dashboard/overview`);
    }

    getDashboardRevenueData(): Observable<IResponse<IAdminDashboardRevenue[]>> {
        return this._http.get<IResponse<IAdminDashboardRevenue[]>>(`${this._adminUrl}/dashboard/revenue`);
    }

    getSubscriptionData(): Observable<IResponse<IAdminDashboardSubscription>> {
        return this._http.get<IResponse<IAdminDashboardSubscription>>(`${this._adminUrl}/dashboard/subscription`);
    }

    getUserStats(): Observable<IResponse<IAdminDashboardUserStats>> {
        return this._http.get<IResponse<IAdminDashboardUserStats>>(`${this._adminUrl}/dashboard/user_stats`);
    }

    getTopEarningProviders(): Observable<IResponse<ITopProviders[]>> {
        return this._http.get<IResponse<ITopProviders[]>>(`${this._adminUrl}/dashboard/top_providers`);
    }

    downloadBookingReport(data: Partial<IReportDownloadBookingData>): Observable<Blob> {
        return this._http.post<Blob>(`${this._adminUrl}/bookings/download_report`, data, {
            responseType: 'blob' as 'json'
        });
    }

    downloadUserReport(data: IReportDownloadUserData): Observable<Blob> {
        return this._http.post<Blob>(`${this._adminUrl}/users/download_report`, data, {
            responseType: 'blob' as 'json'
        });
    }

    downloadTransactionReport(data: IReportDownloadTransactionData): Observable<Blob> {
        return this._http.post<Blob>(`${this._adminUrl}/transactions/download_report`, data, {
            responseType: 'blob' as 'json'
        });
    }

    fetchSettings(): Observable<IResponse<IAdminSettings>> {
        return this._http.get<IResponse<IAdminSettings>>(`${this._adminUrl}/settings`);
    }

    updateSettings(field: Partial<IAdminSettings>): Observable<IResponse<IAdminSettings>> {
        return this._http.patch<IResponse<IAdminSettings>>(`${this._adminUrl}/settings`, field);
    }

    fetchBookingDetails(bookingId: string): Observable<IResponse<IAdminBookingDetails>> {
        return this._http.get<IResponse<IAdminBookingDetails>>(`${this._adminUrl}/bookings/details/${bookingId}`);
    }
}