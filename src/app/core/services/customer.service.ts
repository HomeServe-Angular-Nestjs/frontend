import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { ICustomer } from "../models/user.model";
import { catchError, Observable, throwError } from "rxjs";
import { IFilter } from "../models/filter.model";
import { IResponse } from "../../modules/shared/models/response.model";

@Injectable({ providedIn: 'root' })
export class CustomerService {
    private _http = inject(HttpClient);

    private readonly _apiUrl = API_ENV.customer;

    /**
     * Retrieves the filtered customers.
     * @param {IFilter} filter - Contains the filter data. 
     * @returns An Observable of the filtered customers.
     */
    getCustomers(filter: IFilter = {}): Observable<ICustomer[]> {
        const params = this._buildFilterParams(filter);
        return this._http.get<ICustomer[]>(`${this._apiUrl}/customers`, { params }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    /**
     * @returns An Observable of the customer's avatar.
     */
    fetchOneCustomer(): Observable<ICustomer> {
        return this._http.get<ICustomer>(`${this._apiUrl}/customer`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    /**
     * Updates specific fields of a customer (partial update).
     * @param data - A partial customer object.
     * @returns An observable of the updated customer.
     */
    partialUpdate(data: Partial<ICustomer>): Observable<ICustomer> {
        return this._http.patch<ICustomer>(`${this._apiUrl}/partial_update`, data).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    updateAddToSaved(providerId: string): Observable<ICustomer> {
        return this._http.patch<ICustomer>(`${this._apiUrl}/saved_providers`, { providerId }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    searchProviders(search: string): Observable<IResponse> {
        const params = new HttpParams().set('search', search);
        return this._http.get<IResponse>(`${this._apiUrl}/search_providers`, { params }).pipe(
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

    /**
     * Extracts a readable error message from an HTTP error.
     * @param error - The HTTP error response.
     * @returns A user-friendly error message.
     */
    private getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || 'something went wrong';
    }
}

