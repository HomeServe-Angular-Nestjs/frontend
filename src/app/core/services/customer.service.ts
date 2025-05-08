import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { ICustomer } from "../models/user.model";
import { catchError, Observable, throwError } from "rxjs";

@Injectable({ providedIn: 'root' })
export class CustomerService {
    private _http = inject(HttpClient);

    private readonly _apiUrl = API_ENV.customer;

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
        )
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