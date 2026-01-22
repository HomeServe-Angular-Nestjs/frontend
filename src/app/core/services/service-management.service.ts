import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { Observable } from "rxjs";
import { IProviderService, IProviderServiceFilter } from "../models/provider-service.model";
import { IResponse } from "../../modules/shared/models/response.model";

@Injectable({ providedIn: 'root' })
export class ServiceManagementService {
  private _http = inject(HttpClient);
  private readonly _apiUrl = API_ENV.providerService;

  createService(formData: FormData): Observable<IResponse<IProviderService>> {
    return this._http.post<IResponse<IProviderService>>(`${this._apiUrl}`, formData);
  }

  updateService(serviceId: string, formData: FormData): Observable<IResponse<IProviderService>> {
    return this._http.put<IResponse<IProviderService>>(`${this._apiUrl}/${serviceId}`, formData);
  }

  deleteService(serviceId: string): Observable<IResponse<IProviderService>> {
    return this._http.delete<IResponse<IProviderService>>(`${this._apiUrl}/${serviceId}`);
  }

  toggleServiceStatus(serviceId: string): Observable<IResponse<IProviderService>> {
    return this._http.patch<IResponse<IProviderService>>(`${this._apiUrl}/${serviceId}/toggle-status`, {});
  }

  getServices(params?: IProviderServiceFilter): Observable<IResponse<IProviderService[]>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this._http.get<IResponse<IProviderService[]>>(`${this._apiUrl}/my-services`, { params: httpParams });
  }


  getServicesByProviderId(providerId: string): Observable<IResponse<IProviderService[]>> {
    return this._http.get<IResponse<IProviderService[]>>(`${this._apiUrl}/${providerId}`);
  }

  getOneService(serviceId: string): Observable<IResponse<IProviderService>> {
    return this._http.get<IResponse<IProviderService>>(`${this._apiUrl}/${serviceId}`);
  }

  canCreateService(): Observable<IResponse<boolean>> {
    return this._http.post<IResponse<boolean>>(`${this._apiUrl}/can-create-service`, {});
  }
}