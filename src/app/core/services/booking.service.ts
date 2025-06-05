import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { BehaviorSubject, catchError, Observable, throwError } from "rxjs";
import { CustomerLocationType, IBookingData, IBookingFilter, IBookingOverviewData, IBookingResponse, IBookingWithPagination, IPriceBreakup, IPriceBreakupData, IResponseProviderBookingLists } from "../models/booking.model";
import { ISlotSource } from "../models/schedules.model";



@Injectable({ providedIn: 'root' })
export class BookingService {
    private _http = inject(HttpClient);

    private _addressSource = new BehaviorSubject<CustomerLocationType | null>(null);
    address$ = this._addressSource.asObservable();

    private _slotSource = new BehaviorSubject<ISlotSource | null>(null);
    slot$ = this._slotSource.asObservable();

    private _customerApi = API_ENV.customer;
    private _providerApi = API_ENV.provider;

    setSelectedAddress(newAddress: CustomerLocationType | null) {
        this._addressSource.next(newAddress);
    }

    setSelectedSlot(data: ISlotSource) {
        this._slotSource.next(data);
    }

    fetchPriceBreakup(data: IPriceBreakup[]): Observable<IPriceBreakupData> {
        return this._http.post<IPriceBreakupData>(`${this._customerApi}/booking/price_breakup`, data).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    postBookingData(data: IBookingData): Observable<boolean> {
        return this._http.post<boolean>(`${this._customerApi}/booking/confirm`, data).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    fetchBookings(page: number = 1): Observable<IBookingWithPagination> {
        const params = new HttpParams()
            .set('page', page);

        return this._http.get<IBookingWithPagination>(`${this._customerApi}/booking/fetch`, { params }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }


    //*** ********************************************[PROVIDER APIs]*************************************************** ***//

    fetchBookingList(page: number = 1, filter: IBookingFilter): Observable<IResponseProviderBookingLists> {
        let params = new HttpParams()
            .set('page', page.toString());

        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params = params.set(key, value);
            }
        });

        return this._http.get<IResponseProviderBookingLists>(`${this._providerApi}/bookings`, { params }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    fetchBookingOverviewData(): Observable<IBookingOverviewData> {
        return this._http.get<IBookingOverviewData>(`${this._providerApi}/bookings/overview_data`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    private getErrorMessage(error: HttpErrorResponse): string {
        return error?.error?.message || error?.message || 'something went wrong';
    }
}