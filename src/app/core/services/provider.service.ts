import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, Observable, throwError } from "rxjs";
import { IProvider } from "../models/user.model";
import { API_ENV } from "../../environments/api.environments";
import { SlotType } from "../models/schedules.model";
import { IFilter } from "./customer.service";

@Injectable({ providedIn: 'root' })
export class ProviderService {
    private _http = inject(HttpClient);

    private providerDataSource = new BehaviorSubject<IProvider | null>(null);
    private readonly _apiUrl = API_ENV.provider;

    /** Observable stream of current provider data */
    providerData$ = this.providerDataSource.asObservable();

    /**
     * Fetches the list of all providers.
     * @returns An observable containing an array of providers.
     */
    getProviders(filter: IFilter = {}): Observable<IProvider[]> {
        const params = this._buildFilterParams(filter);
        return this._http.get<IProvider[]>(`${this._apiUrl}/fetch_providers`, { params });
    }

    /**
     * Fetches data for a single provider by ID.
     * @param id - The ID of the provider (optional; can be null).
     * @returns An observable containing the provider data.
     */
    getOneProvider(id: string | null = null): Observable<IProvider> {
        return this._http.get<IProvider>(`${this._apiUrl}/fetch_one_provider?id=${id}`);
    }

    /**
    * Updates a provider with full or file-based data (e.g., multipart form).
    * @param formData - A FormData object or a partial provider object.
    * @returns An observable of the updated provider.
    */
    bulkUpdate(formData: FormData | Partial<IProvider>): Observable<IProvider> {
        return this._http.patch<IProvider>(`${this._apiUrl}/update_provider`, formData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    /**
     * Updates specific fields of a provider (partial update).
     * @param data - A partial provider object.
     * @returns An observable of the updated provider.
     */
    partialUpdate(data: Partial<IProvider>): Observable<IProvider> {
        return this._http.patch<IProvider>(`${this._apiUrl}/partial_update`, data).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    /**
     * Updates the default slot for a provider.
     * @param slot - The slot data to update.
     * @returns An observable of the response.
     */
    updateDefaultSlot(slot: SlotType) {
        return this._http.patch(`${this._apiUrl}/default_slots`, slot).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    /**
    * Deletes the default slot for the current provider.
    * @returns An observable of the response.
    */
    deleteDefaultSlot() {
        return this._http.delete(`${this._apiUrl}/default_slots`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    /**
     * Updates the BehaviorSubject with new provider data.
     * @param data - The provider data to set.
     */
    setProviderData(data: IProvider) {
        this.providerDataSource.next(data);
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

    /**
     * Extracts a readable error message from an HTTP error.
     * @param error - The HTTP error response.
     * @returns A user-friendly error message.
     */
    private getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || 'something went wrong';
    }
}
