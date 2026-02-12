import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { ICoupon, ICouponFilter, ICouponWithPagination, IUpsertCoupon } from "../models/coupon.model";
import { Observable } from "rxjs";
import { IResponse } from "../../modules/shared/models/response.model";

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly _http = inject(HttpClient);
  private readonly _couponApi = API_ENV.coupon;

  getAllCoupon(filter: ICouponFilter, option: { page: number, limit: number }): Observable<IResponse<ICouponWithPagination>> {
    let params = new HttpParams()
      .set('page', option.page)
      .set('limit', option.limit);

    for (const [key, value] of Object.entries(filter)) {
      if (value && value !== undefined) {
        params = params.set(key, value);
      }
    }

    return this._http.get<IResponse<ICouponWithPagination>>(`${this._couponApi}`, { params })
  }

  generateCouponCode(): Observable<IResponse<string>> {
    return this._http.get<IResponse<string>>(`${this._couponApi}/code`);
  }

  createCoupon(couponData: IUpsertCoupon): Observable<IResponse<ICoupon>> {
    return this._http.post<IResponse<ICoupon>>(`${this._couponApi}`, couponData);
  }

  editCoupon(couponId: string, couponData: IUpsertCoupon): Observable<IResponse<ICoupon>> {
    return this._http.put<IResponse<ICoupon>>(`${this._couponApi}/${couponId}`, couponData);
  }

  deleteCoupon(couponId: string): Observable<IResponse> {
    return this._http.delete<IResponse>(`${this._couponApi}/${couponId}`);
  }

  toggleCouponStatus(couponId: string): Observable<IResponse> {
    return this._http.patch<IResponse>(`${this._couponApi}/${couponId}/status`, {});
  }
}