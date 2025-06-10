import { Injectable } from "@angular/core";
import { RazorpayOrder } from "../../models/payment.model";
import { API_KEY } from "../../../environments/api.environments";

@Injectable()
export class RazorpayWrapperService {
    private readonly _razorpayKey: string = API_KEY.razorpay;

    openCheckout(order: RazorpayOrder, onSuccess: (response: any) => void, onFailure?: () => void): void {
        const options = {
            key: this._razorpayKey,
            amount: order.amount,
            currency: order.currency,
            name: 'Your App',
            description: 'Payment for services',
            order_id: order.id,
            handler: onSuccess,
            modal: {
                ondismiss: () => onFailure?.()
            },
            prefill: {
                name: 'User',
                email: 'user@example.com',
                contact: '9999999999'
            },
            theme: {
                color: '#556B2F' // Your theme color
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    }
}