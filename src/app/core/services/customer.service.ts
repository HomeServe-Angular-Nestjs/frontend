import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { IChangePassword, ICustomer, ICustomerProfileData, IDisplayReviews } from "../models/user.model";
import { catchError, Observable, throwError } from "rxjs";
import { IFilter } from "../models/filter.model";
import { IResponse } from "../../modules/shared/models/response.model";
import { ISubmitReview } from "../models/reviews.model";
import { ICustomerSearchCategories } from "../models/category.model";

@Injectable({ providedIn: 'root' })
export class CustomerService {
    private readonly _http = inject(HttpClient);
    private readonly _apiUrl = API_ENV.customer;

    getCustomers(filter: IFilter = {}): Observable<ICustomer[]> {
        let params = new HttpParams();

        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params = params.set(key, value);
            }
        });

        return this._http.get<ICustomer[]>(`${this._apiUrl}/customers`, { params });
    }

    fetchOneCustomer(): Observable<ICustomer> {
        return this._http.get<ICustomer>(`${this._apiUrl}/customer`);
    }

    partialUpdate(data: Partial<ICustomer>): Observable<ICustomer> {
        return this._http.patch<ICustomer>(`${this._apiUrl}/partial_update`, data);
    }

    updateAddToSaved(providerId: string): Observable<ICustomer> {
        return this._http.patch<ICustomer>(`${this._apiUrl}/saved_providers`, { providerId });
    }

    searchProviders(search: string): Observable<IResponse> {
        const params = new HttpParams().set('search', search);
        return this._http.get<IResponse>(`${this._apiUrl}/search_providers`, { params });
    }

    searchCategories(search: string): Observable<IResponse<ICustomerSearchCategories[]>> {
        const params = new HttpParams().set('search', search);
        return this._http.get<IResponse<ICustomerSearchCategories[]>>(`${this._apiUrl}/search-services`, { params });
    }

    updateProfile(profileData: ICustomerProfileData): Observable<IResponse<ICustomer>> {
        return this._http.put<IResponse<ICustomer>>(`${this._apiUrl}/profile`, profileData);
    }

    changePassword(passwordData: IChangePassword): Observable<IResponse<ICustomer>> {
        return this._http.patch<IResponse<ICustomer>>(`${this._apiUrl}/password`, passwordData);
    }

    changeAvatar(formData: FormData): Observable<IResponse<ICustomer>> {
        return this._http.patch<IResponse<ICustomer>>(`${this._apiUrl}/avatar`, formData);
    }

    submitReview(reviewData: ISubmitReview): Observable<IResponse<IDisplayReviews>> {
        return this._http.post<IResponse<IDisplayReviews>>(`${this._apiUrl}/reviews`, reviewData);
    }

    getProviderGalleryImages(providerId: string): Observable<IResponse<string[]>> {
        return this._http.get<IResponse<string[]>>(`${this._apiUrl}/gallery_images/${providerId}`);
    }
}