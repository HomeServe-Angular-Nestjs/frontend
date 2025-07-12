import { TransactionType } from "../enums/enums";
import { ITransaction } from "./transaction.model";

export interface RazorpayOrder {
    id: string;
    transactionType: TransactionType;
    amount: number;
    currency: string;
    receipt: string;
    offer_id: string | null;
    status: 'created' | 'attempted' | 'paid';
    created_at: number;
    method: string;
}

export interface RazorpayPaymentResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface IVerifiedPayment {
    verified: boolean,
    transaction: ITransaction
}