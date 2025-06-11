import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { catchError, Observable, pipe, throwError } from "rxjs";
import { IOfferedService, ISubService, IToggleServiceStatus, IUpdateSubservice } from "../models/offeredService.model";
import { IFilter } from "../models/filter.model";

@Injectable({ providedIn: 'root' })
export class OfferedServicesService {
    private _http = inject(HttpClient);

    private _apiUrl = API_ENV.provider;

    uploadImage(formData: FormData): Observable<{ imageUrl: string }> {
        return this._http.post<{ imageUrl: string }>(`${this._apiUrl}/uploadImage`, formData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    sendFormData(formData: FormData) {
        return this._http.post(`${this._apiUrl}/create_service`, formData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    fetchOfferedServices(): Observable<IOfferedService[]> {
        return this._http.get<IOfferedService[]>(`${this._apiUrl}/offered_services`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    fetchOneService(id: string): Observable<IOfferedService> {
        return this._http.get<IOfferedService>(`${this._apiUrl}/offered_service?id=${id}`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        )
    }

    fetchSubservice(id: string): Observable<ISubService> {
        return this._http.get<ISubService>(`${this._apiUrl}/fetch_subservice?id=${id}`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        )
    }

    updateService(updateData: Partial<IOfferedService> | FormData): Observable<IOfferedService> {
        return this._http.patch<IOfferedService>(`${this._apiUrl}/offered_service`, updateData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    updateSubService(updateData: Partial<ISubService>): Observable<{ id: string, subService: ISubService }> {
        return this._http.patch<{ id: string, subService: ISubService }>(`${this._apiUrl}/subservice`, updateData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    fetchFilteredServices(providerId: string, filter: IFilter): Observable<IOfferedService[]> {
        const params = this._buildFilterParams(filter);
        return this._http.get<IOfferedService[]>(`${this._apiUrl}/filter_service?id=${providerId}`, { params }).pipe(
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