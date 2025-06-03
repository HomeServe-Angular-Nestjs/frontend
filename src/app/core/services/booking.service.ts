import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/api.environments";
import { BehaviorSubject, catchError, Observable, throwError } from "rxjs";
import { CustomerLocationType, IBookingData, IBookingResponse, IPriceBreakup, IPriceBreakupData, IProviderBookingLists } from "../models/booking.model";
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

    fetchBookings(): Observable<IBookingResponse[]> {
        return this._http.get<IBookingResponse[]>(`${this._customerApi}/booking/fetch`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }


    //*** ********************************************[PROVIDER APIs]*************************************************** ***//

    fetchBookingList():Observable<IProviderBookingLists[]> {
        return this._http.get<IProviderBookingLists[]>(`${this._providerApi}/bookings`).pipe(
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