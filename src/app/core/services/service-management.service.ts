import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/env";
import { BehaviorSubject, catchError, Observable, pipe, throwError } from "rxjs";
import { IOfferedService, IServiceFilter, IServicesWithPagination, ISubService, IToggleServiceStatus, IUpdateSubservice } from "../models/offeredService.model";
import { IFilter } from "../models/filter.model";
import { IResponse } from "../../modules/shared/models/response.model";

@Injectable({ providedIn: 'root' })
export class OfferedServicesService {
    private _http = inject(HttpClient);
    private readonly _apiUrl = API_ENV.provider;

    private _serviceDataSource = new BehaviorSubject<IOfferedService[]>([]);
    storedServiceData$ = this._serviceDataSource.asObservable();

    setServiceData(data: IOfferedService[]) {
        this._serviceDataSource.next(data);
    }

    getServiceData(): IOfferedService[] {
        return this._serviceDataSource.getValue();
    }

    fetchOneService(id: string): Observable<IOfferedService> {
        return this._http.get<IOfferedService>(`${this._apiUrl}/offered_service?id=${id}`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        )
    }

    // ------------------------------------------------------------------------------------------------------------------------------
    // **************************************************[Customer Related APIs]*******************************************************
    // ------------------------------------------------------------------------------------------------------------------------------

    fetchFilteredServices(providerId: string, filter: IFilter): Observable<IOfferedService[]> {
        const params = this._buildFilterParams(filter);
        return this._http.get<IOfferedService[]>(`${this._apiUrl}/filter_service?id=${providerId}`, { params }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    getHomepageServiceTitles(): Observable<IResponse<string[]>> {
        return this._http.get<IResponse<string[]>>(`${this._apiUrl}/service/titles`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------------
    // **************************************************[Provider Related APIs]*******************************************************
    // ------------------------------------------------------------------------------------------------------------------------------

    createService(formData: FormData): Observable<IResponse<string[]>> {
        return this._http.post<IResponse<string[]>>(`${this._apiUrl}/service`, formData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    fetchOfferedServices(filters: IServiceFilter, page: number): Observable<IServicesWithPagination> {
        let params = new HttpParams().set('page', page);

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params = params.set(key, value);
            }
        });
        return this._http.get<IServicesWithPagination>(`${this._apiUrl}/service`, { params }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    updateService(updateData: FormData): Observable<IResponse<IOfferedService>> {
        return this._http.put<IResponse<IOfferedService>>(`${this._apiUrl}/service`, updateData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    toggleServiceStatus(data: IToggleServiceStatus): Observable<boolean> {
        return this._http.patch<boolean>(`${this._apiUrl}/service/status`, data).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    toggleSubServiceStatus(data: IUpdateSubservice): Observable<boolean> {
        return this._http.patch<boolean>(`${this._apiUrl}/service/sub_status`, data).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    removeService(serviceId: string): Observable<IResponse<string[]>> {
        return this._http.patch<IResponse<string[]>>(`${this._apiUrl}/service/remove`, { serviceId }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    removeSubService(serviceId: string, subId: string): Observable<IResponse> {
        return this._http.patch<IResponse>(`${this._apiUrl}/service/remove_sub`, { serviceId, subId }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }


    // ------------------------------------------------------------------------------------------------------------------------------
    // **************************************************[Private Methods]*******************************************************
    // ------------------------------------------------------------------------------------------------------------------------------

    /**
     * Converts a plain filter object into HttpParams by omitting null or undefined values.
     * @param {IFilter} filter - The filter criteria to convert.
     * @returns HttpParams - Angular-compatible query parameters.
     */
    private _buildFilterParams(filter: IFilter): HttpParams {
        let params = new HttpParams();

        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params = params.set(key, value);
            }
        });

        return params;
    }

    private getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || 'something went wrong';
    }
}