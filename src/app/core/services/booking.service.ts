import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { BehaviorSubject, catchError, map, Observable, throwError } from "rxjs";
import { CustomerLocationType, IBookingData, IPriceBreakup, IPriceBreakupData } from "../models/booking.model";
import { ISlotSource } from "../models/schedules.model";
import { IBooking, IBookingResponse } from "../models/bookings.model";



@Injectable({ providedIn: 'root' })
export class CustomerBookingService {
    private _http = inject(HttpClient);

    private _addressSource = new BehaviorSubject<CustomerLocationType | null>(null);
    address$ = this._addressSource.asObservable();

    private _slotSource = new BehaviorSubject<ISlotSource | null>(null);
    slot$ = this._slotSource.asObservable();

    private _apiUrl = API_ENV.customer;

    setSelectedAddress(newAddress: CustomerLocationType | null) {
        this._addressSource.next(newAddress);
    }

    setSelectedSlot(data: ISlotSource) {
        this._slotSource.next(data);
    }

    fetchPriceBreakup(data: IPriceBreakup[]): Observable<IPriceBreakupData> {
        return this._http.post<IPriceBreakupData>(`${this._apiUrl}/booking/price_breakup`, data).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    postBookingData(data: IBookingData): Observable<boolean> {
        return this._http.post<boolean>(`${this._apiUrl}/booking/confirm`, data).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    fetchBookings(): Observable<IBookingResponse[]> {
        return this._http.get<IBookingResponse[]>(`${this._apiUrl}/booking/fetch`).pipe(
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