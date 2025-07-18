import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/env";
import { IApprovalOverviewData, IApprovalTableDetails, IRemoveData, IUpdateUserStatus, IUserData, IUserDataWithPagination, UType } from "../models/user.model";
import { BehaviorSubject, catchError, Observable, tap, throwError } from "rxjs";
import { IFilter } from "../models/filter.model";
import { IResponse } from "../../modules/shared/models/response.model";
import { IAdminBookingForTable } from "../models/booking.model";

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

    private getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || 'something went wrong';
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
            }),
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    updateStatus(updateData: Omit<IUpdateUserStatus, 'action'>): Observable<boolean> {
        return this._http.patch<boolean>(`${this._adminUrl}/users/status`, updateData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    removeUser(removeData: IRemoveData): Observable<boolean> {
        return this._http.patch<boolean>(`${this._adminUrl}/users/remove`, removeData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }


    fetchApprovalOverviewDetails(): Observable<IResponse<IApprovalOverviewData>> {
        return this._http.get<IResponse<IApprovalOverviewData>>(`${this._adminUrl}/approvals/overview`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    fetchApprovalTableData(): Observable<IResponse<IApprovalTableDetails[]>> {
        return this._http.get<IResponse<IApprovalTableDetails[]>>(`${this._adminUrl}/approvals/data`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    getBookings(): Observable<IResponse<IAdminBookingForTable[]>> {
        return this._http.get<IResponse<IAdminBookingForTable[]>>(`${this._adminUrl}/bookings`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

}