import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { API_ENV } from '../../../environments/env';
import { IResponse } from '../../modules/shared/models/response.model';
import { ICustomerSearchCategories } from '../models/category.model';
import { ILandingData } from '../models/landing.model';

@Injectable({ providedIn: 'root' })
export class LandingService {
  private readonly _http = inject(HttpClient);
  private readonly _landingUrl = API_ENV.landing;

  getLandingData(): Observable<IResponse<ILandingData>> {
    return this._http
      .get<IResponse<ILandingData>>(`${this._landingUrl}/home`)
      .pipe(shareReplay(1));
  }

  searchCategories(search: string): Observable<IResponse<ICustomerSearchCategories[]>> {
    const params = new HttpParams().set('search', search);
    return this._http.get<IResponse<ICustomerSearchCategories[]>>(`${this._landingUrl}/search-categories`, { params });
  }
}