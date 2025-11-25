import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, shareReplay } from "rxjs";
import { IDisplayReviews, IFilterFetchProviders, IProvider, IProviderCardWithPagination, IProviderUpdateBio } from "../models/user.model";
import { API_ENV } from "../../../environments/env";
import { SlotType } from "../models/schedules.model";
import { IResponse } from "../../modules/shared/models/response.model";

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private _http = inject(HttpClient);

  private providerDataSource = new BehaviorSubject<IProvider | null>(null);
  private readonly _apiUrl = API_ENV.provider;

  providerData$ = this.providerDataSource.asObservable();

  private _buildFilterParams(filter: object): HttpParams {
    let params = new HttpParams();

    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value);
      }
    });

    return params;
  }

  setProviderData(data: IProvider) {
    this.providerDataSource.next(data);
  }

  getProviders(filter: IFilterFetchProviders): Observable<IResponse<IProviderCardWithPagination>> {
    let params = this._buildFilterParams(filter);

    console.log(params.toString())

    return this._http.get<IResponse<IProviderCardWithPagination>>(`${this._apiUrl}/fetch_providers`, { params });
  }

  getOneProvider(id: string | null = null): Observable<IProvider> {
    return this._http.get<IProvider>(`${this._apiUrl}/fetch_one_provider?id=${id}`).pipe(shareReplay(1));
  }

  bulkUpdate(formData: FormData | Partial<IProvider>): Observable<IProvider> {
    return this._http.patch<IProvider>(`${this._apiUrl}/update_provider`, formData);
  }

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

  getReviews(providerId: string, count: number = 0): Observable<IResponse<IDisplayReviews>> {
    const params = new HttpParams()
      .set('providerId', providerId)
      .set('count', count);
    return this._http.get<IResponse<IDisplayReviews>>(`${this._apiUrl}/reviews`, { params });
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

  updatePassword(currentPassword: string, newPassword: string): Observable<IResponse> {
    return this._http.patch<IResponse>(`${this._apiUrl}/update_password`, { currentPassword, newPassword });
  }

  getDashboardOverview(): Observable<IResponse> {
    return this._http.get<IResponse>(`${this._apiUrl}/dashboard/overview`);
  }
}
