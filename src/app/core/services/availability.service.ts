import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_ENV } from '../../../environments/env';
import { Observable } from 'rxjs';
import { IWeeklyAvailability } from '../models/availability.model';
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
}
