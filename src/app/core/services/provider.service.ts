import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, Observable, shareReplay, throwError } from "rxjs";
import { IDisplayReviews, IHomeSearch, IProvider, IProviderCardView, IProviderUpdateBio } from "../models/user.model";
import { API_ENV } from "../../../environments/env";
import { SlotType } from "../models/schedules.model";
import { IFilter } from "../models/filter.model";
import { IResponse } from "../../modules/shared/models/response.model";
import { UploadType } from "../enums/enums";

@Injectable({ providedIn: 'root' })
export class ProviderService {
    private _http = inject(HttpClient);

    private providerDataSource = new BehaviorSubject<IProvider | null>(null);
    private readonly _apiUrl = API_ENV.provider;

    providerData$ = this.providerDataSource.asObservable();

    private _buildFilterParams(filter: IFilter): HttpParams {
        let params = new HttpParams();

        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params = params.set(key, value);
            }
        });

        return params;
    }

    // Updates the BehaviorSubject with new provider data.
    setProviderData(data: IProvider) {
        this.providerDataSource.next(data);
    }

    getProviders(filter: IFilter = {}, locationSearch?: IHomeSearch): Observable<IResponse<IProviderCardView[]>> {
        let params = this._buildFilterParams(filter);

        if (locationSearch) {
            params = params.set('lat', locationSearch.lat.toString())
                .set('lng', locationSearch.lng.toString())
                .set('title', locationSearch.title);
        }

        return this._http.get<IResponse<IProviderCardView[]>>(`${this._apiUrl}/fetch_providers`, { params });
    }

    getOneProvider(id: string | null = null): Observable<IProvider> {
        return this._http.get<IProvider>(`${this._apiUrl}/fetch_one_provider?id=${id}`).pipe(shareReplay(1));
    }

    // Updates a provider with full or file-based data (e.g., multipart form).
    bulkUpdate(formData: FormData | Partial<IProvider>): Observable<IProvider> {
        return this._http.patch<IProvider>(`${this._apiUrl}/update_provider`, formData);
    }

    // Updates specific fields of a provider (partial update).
    partialUpdate(data: Partial<IProvider>): Observable<IProvider> {
        return this._http.patch<IProvider>(`${this._apiUrl}/partial_update`, data);
    }

    updateDefaultSlot(slot: SlotType): Observable<SlotType[]> {
        return this._http.patch<SlotType[]>(`${this._apiUrl}/default_slots`, slot);
    }

    updateBio(updateData: IProviderUpdateBio): Observable<IResponse<IProvider>> {
        return this._http.put<IResponse<IProvider>>(`${this._apiUrl}/bio`, updateData);
    }

    uploadCertificate(formData: FormData): Observable<IResponse<IProvider>> {
        return this._http.put<IResponse<IProvider>>(`${this._apiUrl}/cert_upload`, formData);
    }

    deleteDefaultSlot() {
        return this._http.delete(`${this._apiUrl}/default_slots`);
    }

    getReviews(providerId: string): Observable<IResponse<IDisplayReviews[]>> {
        const params = new HttpParams().set('providerId', providerId);
        return this._http.get<IResponse<IDisplayReviews[]>>(`${this._apiUrl}/reviews`, { params });
    }

    uploadImage(imageData: FormData): Observable<IResponse> {
        return this._http.patch<IResponse>(`${this._apiUrl}/gallery_upload`, imageData);
    }

    getWorkImages(): Observable<IResponse<string[]>> {
        return this._http.get<IResponse<string[]>>(`${this._apiUrl}/work_images`);
    }

    getAvgRating(providerId: string): Observable<IResponse<number>> {
        return this._http.get<IResponse<number>>(`${this._apiUrl}/avg_rating/${providerId}`);
    }
}
