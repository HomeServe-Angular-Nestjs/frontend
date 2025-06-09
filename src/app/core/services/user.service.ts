import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { IUpdateUserStatus, IUserData, UType } from "../models/user.model";
import { BehaviorSubject, catchError, forkJoin, Observable, of, throwError } from "rxjs";
import { IFilter } from "../models/filter.model";

@Injectable({ providedIn: 'root' })
export class UserManagementService {
    private _http = inject(HttpClient);

    private readonly _adminUrl = API_ENV.admin;

    private _roleSource = new BehaviorSubject<UType>("customer");
    role$ = this._roleSource.asObservable();

    private _userDataSource = new BehaviorSubject(null);
    userData$ = this._userDataSource.asObservable();

    setRole(role: UType) {
        this._roleSource.next(role);
    }

    setUserData(data: any) {
        this._userDataSource.next(data);
    }

    getUsers(role: UType, filter: IFilter): Observable<IUserData[]> {
        let params = new HttpParams().set('role', role);

        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params = params.set(key, value);
            }
        });

        return this._http.get<IUserData[]>(`${this._adminUrl}/users`, { params }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    updateStatus(updateData: IUpdateUserStatus): Observable<boolean> {
        return this._http.patch<boolean>(`${this._adminUrl}/status`, updateData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    /**
     * Extracts a readable error message from an HTTP error.
     * @param error - The HTTP error response.
     * @returns A user-friendly error message.
     */
    private getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || 'something went wrong';
    }
}