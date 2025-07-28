import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { IChangePassword, ICustomer, ICustomerProfileData, IDisplayReviews } from "../models/user.model";
import { catchError, Observable, throwError } from "rxjs";
import { IFilter } from "../models/filter.model";
import { IResponse } from "../../modules/shared/models/response.model";
import { IReview, ISubmitReview } from "../models/reviews.model";

@Injectable({ providedIn: 'root' })
export class CustomerService {
    private _http = inject(HttpClient);

    private readonly _apiUrl = API_ENV.customer;

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

    getCustomers(filter: IFilter = {}): Observable<ICustomer[]> {
        const params = this._buildFilterParams(filter);
        return this._http.get<ICustomer[]>(`${this._apiUrl}/customers`, { params }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    fetchOneCustomer(): Observable<ICustomer> {
        return this._http.get<ICustomer>(`${this._apiUrl}/customer`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

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

    searchService(search: string): Observable<IResponse> {
        const params = new HttpParams().set('search', search);
        return this._http.get<IResponse>(`${this._apiUrl}/search_services`, { params }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    updateProfile(profileData: ICustomerProfileData): Observable<IResponse<ICustomer>> {
        return this._http.put<IResponse<ICustomer>>(`${this._apiUrl}/profile`, profileData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    changePassword(passwordData: IChangePassword): Observable<IResponse<ICustomer>> {
        return this._http.patch<IResponse<ICustomer>>(`${this._apiUrl}/password`, passwordData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    changeAvatar(formData: FormData): Observable<IResponse<ICustomer>> {
        return this._http.patch<IResponse<ICustomer>>(`${this._apiUrl}/avatar`, formData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    submitReview(reviewData: ISubmitReview): Observable<IResponse<IDisplayReviews>> {
        return this._http.post<IResponse<IDisplayReviews>>(`${this._apiUrl}/reviews`, reviewData).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    getProviderGalleryImages(providerId: string): Observable<IResponse<string[]>> {
        return this._http.get<IResponse<string[]>>(`${this._apiUrl}/gallery_images/${providerId}`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }
}

