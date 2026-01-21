import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { Observable } from "rxjs";
import { IBookingPaymentVerification, ISubscriptionOrder, ISubscriptionPaymentVerification, RazorpayOrder, RazorpayPaymentResponse } from "../models/payment.model";

@Injectable()
export class PaymentService {
    private _http = inject(HttpClient);
    private _apiUrl = API_ENV.payment;

    createRazorpayOrder(amount: number): Observable<RazorpayOrder> {
        return this._http.post<RazorpayOrder>(`${this._apiUrl}/create_order`, { amount });
    }

    verifyBookingPayment(verifyData: RazorpayPaymentResponse, orderData: RazorpayOrder): Observable<IBookingPaymentVerification> {
        return this._http.post<IBookingPaymentVerification>(`${this._apiUrl}/verify_booking`, { verifyData, orderData });
    }

    verifySubscriptionPayment(verifyData: RazorpayPaymentResponse, orderData: ISubscriptionOrder): Observable<ISubscriptionPaymentVerification> {
        return this._http.post<ISubscriptionPaymentVerification>(`${this._apiUrl}/verify_subscription`, { verifyData, orderData });
    }

    verifyUpgradePayment(verifyData: RazorpayPaymentResponse, orderData: ISubscriptionOrder): Observable<ISubscriptionPaymentVerification> {
        return this._http.post<ISubscriptionPaymentVerification>(`${this._apiUrl}/verify_subscription`, { verifyData, orderData });
    }

    unlockPayment(): Observable<any> {
        return this._http.post(`${this._apiUrl}/release_lock`, {});
    }
}