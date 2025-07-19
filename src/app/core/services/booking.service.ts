import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../environments/env";
import { BehaviorSubject, catchError, Observable, throwError } from "rxjs";
import { IBookingData, IBookingDetailCustomer, IBookingDetailProvider, IBookingFilter, IBookingOverviewData, IBookingWithPagination, IPriceBreakup, IPriceBreakupData, IResponseProviderBookingLists } from "../models/booking.model";
import { IAddress, ISelectedSlot } from "../models/schedules.model";
import { BookingStatus } from "../enums/enums";
import { IResponse } from "../../modules/shared/models/response.model";
import { ILocation } from "../models/user.model";

@Injectable({ providedIn: 'root' })
export class BookingService {
    private _http = inject(HttpClient);

    private _addressSource = new BehaviorSubject<IAddress & Omit<ILocation, 'type'> | null>(null);
    address$ = this._addressSource.asObservable();

    private _slotSource = new BehaviorSubject<ISelectedSlot | null>(null);
    slot$ = this._slotSource.asObservable();

    private _customerApi = API_ENV.customer;
    private _providerApi = API_ENV.provider;

    setSelectedAddress(newAddress: IAddress & Omit<ILocation, 'type'>) {
        this._addressSource.next(newAddress);
    }

    setSelectedSlot(data: ISelectedSlot) {
        this._slotSource.next(data);
    }

    // ------------------------------------------------------------------------------------------------------------------------------
    // **************************************************[Customer Related APIs]*******************************************************
    // ------------------------------------------------------------------------------------------------------------------------------


    fetchPriceBreakup(data: IPriceBreakup[]): Observable<IPriceBreakupData> {
        return this._http.post<IPriceBreakupData>(`${this._customerApi}/booking/price_breakup`, data).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    postBookingData(data: IBookingData): Observable<IResponse> {
        return this._http.post<IResponse>(`${this._customerApi}/booking/confirm`, data).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    updateBooking(data: { transactionId: string | null, bookingId: string }): Observable<IResponse> {
        return this._http.patch<IResponse>(`${this._customerApi}/booking/update`, data).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    fetchBookings(page: number = 1): Observable<IBookingWithPagination> {
        const params = new HttpParams().set('page', page);

        return this._http.get<IBookingWithPagination>(`${this._customerApi}/booking/fetch`, { params }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    fetchBookingDetails(bookingId: string): Observable<IBookingDetailCustomer> {
        const params = new HttpParams().set('bookingId', bookingId);

        return this._http.get<IBookingDetailCustomer>(`${this._customerApi}/booking/view_details`, { params }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    cancelBooking(bookingId: string, reason: string): Observable<IResponse> {
        return this._http.patch<IResponse>(`${this._customerApi}/booking/cancel`, { bookingId, reason }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }


    // ------------------------------------------------------------------------------------------------------------------------------
    // **************************************************[Provider Related APIs]*******************************************************
    // ------------------------------------------------------------------------------------------------------------------------------

    getBookingList(page: number = 1, filter: IBookingFilter): Observable<IResponseProviderBookingLists> {
        let params = new HttpParams().set('page', page.toString());

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

    getBookingOverviewData(): Observable<IBookingOverviewData> {
        return this._http.get<IBookingOverviewData>(`${this._providerApi}/bookings/overview_data`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        );
    }

    getBookingDetails(bookingId: string): Observable<IBookingDetailProvider> {
        const params = new HttpParams().set('bookingId', bookingId);

        return this._http.get<IBookingDetailProvider>(`${this._providerApi}/bookings/fetch_details`, { params }).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() =>
                    new Error(this.getErrorMessage(error)))
            )
        )
    }

    changeBookingStatus(bookingId: string, newStatus: BookingStatus): Observable<IResponse<IBookingDetailProvider>> {
        return this._http.patch<IResponse<IBookingDetailProvider>>(`${this._providerApi}/bookings/b_status`, { bookingId, newStatus }).pipe(
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