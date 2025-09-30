import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { Observable } from "rxjs";
import { IBookingPaymentVerification, ISubscriptionOrder, ISubscriptionPaymentVerification, IVerifiedPayment, RazorpayOrder, RazorpayPaymentResponse } from "../models/payment.model";

const PAYMENT_LOCK_KEY = 'payment_in_progress';

@Injectable()
export class PaymentService {
    private _http = inject(HttpClient);
    private _apiUrl = API_ENV.payment;

    private _paymentInProgress = signal(false);
    readonly isPaymentInProgress = this._paymentInProgress.asReadonly();

    constructor() {
        window.addEventListener('storage', (event) => {
            if (event.key === PAYMENT_LOCK_KEY) {
                this._paymentInProgress.set(event.newValue === 'true')
            }
        });
    }

    private _getFromStorage(): boolean {
        return localStorage.getItem(PAYMENT_LOCK_KEY) === 'true';
    }

    lockPayment(): void {
        localStorage.setItem(PAYMENT_LOCK_KEY, 'true');
        this._paymentInProgress.set(true);
    }

    unlockPayment(): void {
        localStorage.setItem(PAYMENT_LOCK_KEY, 'false');
        this._paymentInProgress.set(false);
    }

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

}