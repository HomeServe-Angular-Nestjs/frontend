import { Injectable } from "@angular/core";
import { RazorpayOrder } from "../../models/payment.model";
import { API_KEY } from "../../../../environments/env";

@Injectable()
export class RazorpayWrapperService {
    private readonly _razorpayKey: string = API_KEY.razorpay;

    openCheckout(order: RazorpayOrder, email: string, contact: string, name: string, onSuccess: (response: any) => void, onFailure?: () => void): void {
        const options = {
            key: this._razorpayKey,
            amount: order.amount,
            currency: 'INR',
            name: 'Your App',
            description: 'Payment for services',
            order_id: order.id,
            handler: onSuccess,
            modal: {
                ondismiss: () => onFailure?.()
            },
            prefill: {
                name,
                email,
                contact,
            },
            theme: {
                color: '#556B2F' // Your theme color
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    }
}