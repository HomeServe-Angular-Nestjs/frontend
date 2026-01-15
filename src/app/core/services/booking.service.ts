import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { BehaviorSubject, Observable, shareReplay } from "rxjs";
import { IBooking, IBookingData, IBookingDetailCustomer, IBookingDetailProvider, IBookingFilter, IBookingOverviewData, IBookingResponse, IBookingWithPagination, IPriceBreakupData, IResponseProviderBookingLists, ISaveBooking, IUpdateBookingsPaymentStatus } from "../models/booking.model";
import { BookingStatus } from "../enums/enums";
import { IResponse } from "../../modules/shared/models/response.model";
import { ILocationData } from "../models/user.model";
import { IReviewFilter, IReviewWithPagination, ISubmitReview } from "../models/reviews.model";
import { ISelectedSlot } from "../models/availability.model";

@Injectable({ providedIn: 'root' })
export class BookingService {
  private _http = inject(HttpClient);

  selectedAddress = signal<ILocationData | null>(null);
  selectedSlot = signal<ISelectedSlot | null>(null);

  private _phoneNumberSource = new BehaviorSubject<string | null>(null);
  phoneNumber$ = this._phoneNumberSource.asObservable();


  private _customerApi = API_ENV.customer;
  private _providerApi = API_ENV.provider;

  setSelectedAddress(newAddress: ILocationData) {
    this.selectedAddress.set(newAddress);
  }

  getSelectedAddress(): ILocationData | null {
    return this.selectedAddress();
  }

  setSelectedPhoneNumber(phoneNumber: string) {
    this._phoneNumberSource.next(phoneNumber);
  }

  // getSelectedPhoneNumber(): string | null {
  //   return this._phoneNumberSource.getValue();
  // }

  // ------------------------------------------------------------------------------------------------------------------------------
  // **************************************************[Customer Related APIs]*******************************************************
  // ------------------------------------------------------------------------------------------------------------------------------

  fetchPriceBreakup(): Observable<IResponse<IPriceBreakupData>> {
    return this._http.get<IResponse<IPriceBreakupData>>(`${this._customerApi}/booking/price_breakup`);
  }

  saveBooking(slotData: ISaveBooking, providerId: string): Observable<IResponse<IBooking>> {
    return this._http.post<IResponse<IBooking>>(`${this._customerApi}/booking/confirm`, { ...slotData, providerId });
  }

  // preBookingData(data: IBookingData): Observable<IResponse<IBooking>> { //todo
  //   return this._http.post<IResponse<IBooking>>(`${this._customerApi}/booking/confirm`, data);
  // }

  updateBooking(data: { transactionId: string | null, bookingId: string }): Observable<IResponse> {
    return this._http.patch<IResponse>(`${this._customerApi}/booking/update`, data);
  }

  updatePaymentStatus(data: IUpdateBookingsPaymentStatus): Observable<IResponse<boolean>> {
    return this._http.patch<IResponse<boolean>>(`${this._customerApi}/booking/payment_status`, data);
  }

  fetchBookings(page: number = 1): Observable<IBookingWithPagination> {
    const params = new HttpParams().set('page', page);
    return this._http.get<IBookingWithPagination>(`${this._customerApi}/booking/fetch`, { params }).pipe(
      shareReplay(1)
    );
  }

  fetchBookingDetails(bookingId: string): Observable<IBookingDetailCustomer> {
    const params = new HttpParams().set('bookingId', bookingId);
    return this._http.get<IBookingDetailCustomer>(`${this._customerApi}/booking/view_details`, { params })
  }

  addReview(bookingId: string, reviewData: ISubmitReview): Observable<IResponse> {
    return this._http.patch<IResponse>(`${this._customerApi}/booking/add_review`, { bookingId, ...reviewData })
  }

  markBookingCancelledByCustomer(bookingId: string, reason: string,): Observable<IResponse<IBookingResponse>> {
    return this._http.patch<IResponse<IBookingResponse>>(`${this._customerApi}/booking/cancel`, { bookingId, reason });
  }
  canCustomerStartCall(providerId: string): Observable<IResponse> {
    return this._http.post<IResponse>(`${this._customerApi}/booking/call`, { providerId });
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

    return this._http.get<IResponseProviderBookingLists>(`${this._providerApi}/bookings`, { params });
  }

  getBookingOverviewData(): Observable<IBookingOverviewData> {
    return this._http.get<IBookingOverviewData>(`${this._providerApi}/bookings/overview_data`)
  }

  getBookingDetails(bookingId: string): Observable<IBookingDetailProvider> {
    const params = new HttpParams().set('bookingId', bookingId);

    return this._http.get<IBookingDetailProvider>(`${this._providerApi}/bookings/fetch_details`, { params });
  }

  getReviewData(page: number = 1, filter: IReviewFilter = {}): Observable<IResponse<IReviewWithPagination>> {
    let params = new HttpParams().set('page', page);

    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value);
      }
    });

    return this._http.get<IResponse<IReviewWithPagination>>(`${this._providerApi}/bookings/review_data`, { params });
  }

  markBookingCancelledByProvider(bookingId: string, reason?: string): Observable<IResponse<IBookingDetailProvider>> {
    return this._http.patch<IResponse<IBookingDetailProvider>>(`${this._providerApi}/bookings/cancel/${bookingId}`, { reason });
  }

  updateBookingStatus(bookingId: string, newStatus: BookingStatus): Observable<IResponse> {
    return this._http.patch<IResponse>(`${this._providerApi}/bookings/status/${bookingId}`, { newStatus });
  }

  completeBooking(bookingId: string): Observable<IResponse<IBookingDetailProvider>> {
    return this._http.post<IResponse<IBookingDetailProvider>>(`${this._providerApi}/bookings/complete`, { bookingId });
  }

  downloadInvoice(bookingId: string): Observable<Blob> {
    return this._http.post<Blob>(`${this._providerApi}/bookings/download_invoice`, { bookingId }, {
      responseType: 'blob' as 'json'
    });
  }

  canProviderStartCall(customerId: string): Observable<IResponse> {
    return this._http.post<IResponse>(`${this._providerApi}/bookings/call`, { customerId });
  }
}
