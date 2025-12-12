import { PaymentDirection, PaymentSource, TransactionType } from "../enums/enums";
import { IPagination } from "./booking.model";

export interface IWallet {
    id: string;
    userId: string;
    currency: string;
    balance: number;
    createdAt: string;
    lastTransactionDate: Date;
}

export interface ICustomerTransactionData {
    transactionId: string;
    paymentId: string | null;
    amount: number;
    method: PaymentDirection;
    source: PaymentSource,
    transactionType: TransactionType;
    createdAt: Date;
}

export interface ICustomerTransactionDataWithPagination {
    transactions: ICustomerTransactionData[];
    pagination: IPagination;
}

export interface IProviderTransactionData {
    createdAt: string;
    paymentId: string | null;
    amount: number;
    method: PaymentDirection;
    transactionType: TransactionType;
    bookingId: string | null;
    subscriptionId: string | null;
    source: PaymentSource;
}

export interface IProviderTransactionDataWithPagination {
    transactions: IProviderTransactionData[];
    pagination: IPagination;
}
