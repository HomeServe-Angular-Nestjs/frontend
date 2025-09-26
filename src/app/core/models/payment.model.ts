import { PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from "../enums/enums";
import { ITransaction } from "./transaction.model";

export interface RazorpayOrder {
    id: string;
    transactionType: TransactionType;
    amount: number;
    receipt: string;
    status: TransactionStatus;
    direction: PaymentDirection;
    source: PaymentSource;
}

export interface IBookingOrder extends RazorpayOrder {
    bookingId: string;
}

export interface RazorpayPaymentResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface IVerifiedPayment {
    verified: boolean,
    transaction: ITransaction
    subscriptionId?: string;
}

export type IBookingPaymentVerification = IVerifiedPayment & Omit<IBookingOrder, keyof RazorpayOrder>;

export interface ISubscriptionOrder extends RazorpayOrder {
    subscriptionId: string;
}

export type ISubscriptionPaymentVerification = IVerifiedPayment & Omit<ISubscriptionOrder, keyof RazorpayOrder>;