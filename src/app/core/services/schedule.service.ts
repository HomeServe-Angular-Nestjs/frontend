import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_ENV } from '../../environments/env';
import { catchError, Observable, throwError } from 'rxjs';
import { IDaysDetails, IMonthSchedule, ISchedule, IScheduleDetailFilters, IScheduleList, IScheduleListWithPagination, ISchedules, IUpdateScheduleDateSlotStatus, IUpdateScheduleDateStatus, IUpdateScheduleStatus, } from '../models/schedules.model';
import { IProvider } from '../models/user.model';
import { IResponse } from '../../modules/shared/models/response.model';

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
  private readonly _scheduleApi = API_ENV.schedule;

  updateSchedule(data: Partial<ISchedule>): Observable<IUpdateSchedule> {
    return this._http.put<IUpdateSchedule>(`${this._apiUrl}/schedules`, data).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() =>
          new Error(this.getErrorMessage(error)))
      ));
  }

  // removeSchedule(date: string, id: string): Observable<{ id: string }> {
  //   if (!date || !id) {
  //     throw new Error('Missing required schedule parameters (date or id)');
  //   }

  //   const params = new HttpParams()
  //     .set('date', date)
  //     .set('id', id);

  //   return this._http.delete<{ id: string }>(`${this._apiUrl}/schedule`, { params }).pipe(
  //     catchError((error: HttpErrorResponse) =>
  //       throwError(() => new Error(this.getErrorMessage(error)))
  //     )
  //   );
  // }

  // ------------------------------------------------------------------------------------------------------------------------------
  // **************************************************[Provider APIs]*******************************************************
  // ------------------------------------------------------------------------------------------------------------------------------

  createSchedules(schedules: IMonthSchedule): Observable<IResponse> {
    return this._http.post<IResponse>(`${this._scheduleApi}`, schedules).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(this.getErrorMessage(error)))
      )
    );
  }

  fetchSchduleList(page: number): Observable<IResponse<IScheduleListWithPagination>> {
    const params = new HttpParams()
      .set('page', page);

    return this._http.get<IResponse<IScheduleListWithPagination>>(`${this._scheduleApi}/list`, { params }).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(this.getErrorMessage(error)))
      )
    );
  }

  fetchScheduleDetails(scheduleId: string, scheduleMonth: string, filters: IScheduleDetailFilters): Observable<IResponse<(IDaysDetails & { expanded: boolean })[]>> {
    let params = new HttpParams()
      .set('id', scheduleId)
      .set('month', scheduleMonth);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value);
      }
    });

    return this._http.get<IResponse<(IDaysDetails & { expanded: boolean })[]>>(`${this._scheduleApi}/details`, { params }).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(this.getErrorMessage(error)))
      )
    );
  }

  toggleScheduleStatus(updateData: IUpdateScheduleStatus): Observable<IResponse> {
    return this._http.patch<IResponse>(`${this._scheduleApi}/status`, updateData).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(this.getErrorMessage(error)))
      )
    );
  }

  toggleScheduleDateStatus(updateData: IUpdateScheduleDateStatus): Observable<IResponse<IDaysDetails[]>> {
    return this._http.patch<IResponse>(`${this._scheduleApi}/date_status`, updateData).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(this.getErrorMessage(error)))
      )
    );
  }

  toggleScheduleDateSlotStatus(updateData: IUpdateScheduleDateSlotStatus): Observable<IResponse> {
    return this._http.patch<IResponse>(`${this._scheduleApi}/slot_status`, updateData).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(this.getErrorMessage(error)))
      )
    );
  }

  removeSchedule(scheduleId: string): Observable<IResponse> {
    return this._http.patch<IResponse>(`${this._scheduleApi}/remove`, { scheduleId }).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(this.getErrorMessage(error)))
      )
    );
  }

  // ------------------------------------------------------------------------------------------------------------------------------
  // **************************************************[Customer APIs]*******************************************************
  // ------------------------------------------------------------------------------------------------------------------------------

  fetchSchedules(providerId: string): Observable<IResponse<ISchedules[]>> {
    const params = new HttpParams().set('providerId', providerId);

    return this._http.get<IResponse<ISchedules[]>>(`${this._scheduleApi}`, { params }).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() =>
          new Error(this.getErrorMessage(error)))
      ));
  }


  private getErrorMessage(error: HttpErrorResponse): string {
    return error?.error?.message || 'something went wrong';
  }
}
