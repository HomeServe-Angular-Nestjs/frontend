import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENV } from '../../environments/api.environments';
import { catchError, Observable, throwError } from 'rxjs';
import { ISchedule, SlotType } from '../models/schedules.model';
import { IProvider } from '../models/user.model';

@Injectable({ providedIn: 'root', })
export class ScheduleService {

  constructor(private http: HttpClient) { }

  private apiUrl = API_ENV.provider;

  fetchSchedules(providerId?: string): Observable<ISchedule[]> {
    return this.http.get<ISchedule[]>(`${this.apiUrl}/schedules?id=${providerId}`).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() =>
          new Error(this.getErrorMessage(error)))
      )
    );
  }

  updateSchedule(data: Partial<ISchedule>): Observable<{ schedule: ISchedule, provider: IProvider }> {
    return this.http.put<{ schedule: ISchedule, provider: IProvider }>(`${this.apiUrl}/schedules`, data).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() =>
          new Error(this.getErrorMessage(error)))
      )
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    return error?.error?.message || 'something went wrong';
  }
}
