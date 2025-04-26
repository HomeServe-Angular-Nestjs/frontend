import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENV } from '../../environments/api.environments';
import { catchError, Observable, throwError } from 'rxjs';
import { ISchedule } from '../models/schedules.model';

@Injectable({ providedIn: 'root', })
export class ScheduleService {

  constructor(private http: HttpClient) { }

  apiUrl = API_ENV.provider;

  updateSchedule(): Observable<ISchedule[]> {
    return this.http.get<ISchedule[]>(`${this.apiUrl}/schedules`).pipe(
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
