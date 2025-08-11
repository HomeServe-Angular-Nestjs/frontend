import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_ENV } from "../../../environments/env";
import { catchError, Observable, throwError } from "rxjs";
import { IVerifiedPayment, RazorpayOrder, RazorpayPaymentResponse } from "../models/payment.model";
import { UType } from "../models/user.model";

@Injectable()
export class PaymentService {
    private _http = inject(HttpClient);
    private _apiUrl = API_ENV.payment;

    createRazorpayOrder(amount: number): Observable<RazorpayOrder> {
        return this._http.post<RazorpayOrder>(`${this._apiUrl}/create_order`, { amount });
    }

    verifyPaymentSignature(verifyData: RazorpayPaymentResponse, orderData: RazorpayOrder, role: UType): Observable<IVerifiedPayment> {
        return this._http.post<IVerifiedPayment>(`${this._apiUrl}/verify_signature`, { verifyData, orderData, role });
    }
}