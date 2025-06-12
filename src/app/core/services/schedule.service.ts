import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_ENV } from '../../environments/api.environments';
import { catchError, Observable, throwError } from 'rxjs';
import { ISchedule, SlotType } from '../models/schedules.model';
import { IProvider } from '../models/user.model';

interface IRemoveSchedule {
  removedScheduleId: string,
  provider: IProvider
}

interface IUpdateSchedule {
  schedule: ISchedule,
  provider: IProvider
}

@Injectable({ providedIn: 'root', })
export class ScheduleService {
  private readonly _http = inject(HttpClient);

  private readonly _apiUrl = API_ENV.provider;

  fetchSchedules(providerId?: string): Observable<ISchedule[]> {
    return this._http.get<ISchedule[]>(`${this._apiUrl}/schedules?id=${providerId}`).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() =>
          new Error(this.getErrorMessage(error)))
      ));
  }

  updateSchedule(data: Partial<ISchedule>): Observable<IUpdateSchedule> {
    return this._http.put<IUpdateSchedule>(`${this._apiUrl}/schedules`, data).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() =>
          new Error(this.getErrorMessage(error)))
      ));
  }

  removeSchedule(date: string, id: string): Observable<{ id: string }> {
    if (!date || !id) {
      throw new Error('Missing required schedule parameters (date or id)');
    }

    const params = new HttpParams()
      .set('date', date)
      .set('id', id);

    return this._http.delete<{ id: string }>(`${this._apiUrl}/schedule`, { params }).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(this.getErrorMessage(error)))
      )
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    return error?.error?.message || 'something went wrong';
  }
}
