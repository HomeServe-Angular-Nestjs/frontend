import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { BehaviorSubject, catchError, Observable, throwError } from "rxjs";
import { IVerifiedPayment, RazorpayOrder, RazorpayPaymentResponse } from "../models/payment.model";
import { UType } from "../models/user.model";

@Injectable()
export class PaymentService {
    private _http = inject(HttpClient);
    private _apiUrl = API_ENV.payment;

    private readonly _ongoingPayment$ = new BehaviorSubject<boolean>(this._loadInitialStatus());

    get ongoingPayment$() {
        return this._ongoingPayment$.asObservable();
    }

    private _loadInitialStatus(): boolean {
        try {
            const status = localStorage.getItem('paymentStatus');
            return status ? JSON.parse(status) === true : false;
        } catch {
            return false;
        }
    }

    setOngoingPayment(status: boolean) {
        localStorage.setItem('paymentStatus', JSON.stringify(status));
        this._ongoingPayment$.next(status);
    }

    checkOngoingPayments(): boolean {
        return this._ongoingPayment$.getValue();
    }

    createRazorpayOrder(amount: number): Observable<RazorpayOrder> {
        return this._http.post<RazorpayOrder>(`${this._apiUrl}/create_order`, { amount });
    }

    verifyPaymentSignature(verifyData: RazorpayPaymentResponse, orderData: RazorpayOrder): Observable<IVerifiedPayment> {
        return this._http.post<IVerifiedPayment>(`${this._apiUrl}/verify_signature`, { verifyData, orderData });
    }
}