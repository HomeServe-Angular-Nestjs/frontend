import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_ENV } from '../../../environments/env';
import { Observable } from 'rxjs';
import { IDateOverride, IDateOverrideViewList, IWeeklyAvailability } from '../models/availability.model';
import { IResponse } from '../../modules/shared/models/response.model';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = API_ENV.availability;

  getAvailability(): Observable<IResponse<IWeeklyAvailability>> {
    return this._http.get<IResponse<IWeeklyAvailability>>(`${this._apiUrl}`);
  }

  updateAvailability(weekData: IWeeklyAvailability['week']): Observable<IResponse<IWeeklyAvailability>> {
    return this._http.put<IResponse<IWeeklyAvailability>>(`${this._apiUrl}`, { week: weekData });
  }

  getDateOverrides(): Observable<IResponse<IDateOverrideViewList[]>> {
    return this._http.get<IResponse<IDateOverrideViewList[]>>(`${this._apiUrl}/overrides`);
  }

  createDateOverride(override: IDateOverrideViewList): Observable<IResponse<IDateOverride>> {
    return this._http.post<IResponse<IDateOverride>>(`${this._apiUrl}/overrides`, override);
  }

  deleteOverride(date: string): Observable<IResponse> {
    const params = new HttpParams().set('date', date);
    return this._http.delete<IResponse>(`${this._apiUrl}/overrides`, { params });
  }
}
