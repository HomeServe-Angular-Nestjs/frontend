import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { Observable } from "rxjs";
import { IProviderService } from "../models/provider-service.model";
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

  getServices(): Observable<IResponse<IProviderService[]>> {
    return this._http.get<IResponse<IProviderService[]>>(`${this._apiUrl}/my-services`);
  }
}
