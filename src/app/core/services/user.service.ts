import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { IRemoveData, IUpdateUserStatus, IUserData, UType } from "../models/user.model";
import { BehaviorSubject, catchError, Observable, tap, throwError } from "rxjs";
import { IFilter } from "../models/filter.model";

@Injectable({ providedIn: 'root' })
export class UserManagementService {
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

    getUsers(role: UType, filter: IFilter): Observable<IUserData[]> {
        let params = new HttpParams().set('role', role);

        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params = params.set(key, value);
            }
        });

        return this._http.get<IUserData[]>(`${this._adminUrl}/users`, { params }).pipe(
            tap(users => {
                this._userDataSource.next(users)
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

    /**
     * Extracts a readable error message from an HTTP error.
     * @param error - The HTTP error response.
     * @returns A user-friendly error message.
     */
    private getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || 'something went wrong';
    }
}