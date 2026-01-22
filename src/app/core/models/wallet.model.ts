import { UserType } from "../../modules/shared/models/user.model";
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
    transactionId: string;
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

export interface IProviderTransactionOverview {
    balance: number;
    totalCredit: number;
    totalDebit: number;
    netGain: number;
}

export interface ITransactionAdminList {
    dateTime: string;
    counterparty: {
        email: string;
        role: UserType;
    };
    type: TransactionType;
    direction: PaymentDirection;
    amount: number;
    referenceId: string;
    referenceType: string;
    source: PaymentSource;
}

export interface IAdminTransactionDataWithPagination {
    transactions: ITransactionAdminList[];
    pagination: IPagination;
}
