import { PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from "../enums/enums";
import { ITransaction } from "./transaction.model";

export interface RazorpayOrder {
    id: string;
    bookingId: string;
    transactionType: TransactionType;
    amount: number;
    receipt: string;
    status: TransactionStatus;
    direction: PaymentDirection;
    source: PaymentSource;
}

export interface RazorpayPaymentResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface IVerifiedPayment {
    verified: boolean,
    transaction: ITransaction
    bookingId?: string;
    subscriptionId?: string;
}