import { PaymentDirection, PaymentSource, TransactionStatus, TransactionType } from "../enums/enums";
import { IPagination } from "./booking.model";

export interface ITransaction {
    id: string;
    userId: string;
    transactionType: TransactionType
    direction: PaymentDirection;
    source: PaymentSource;
    status: TransactionStatus;
    amount: number;
    currency: string;
    gateWayDetails: {
        orderId: string,
        paymentId: string,
        signature: string,
        receipt: string | null,
    }
    userDetails: {
        email: string,
        contact: string,
    }
}

export interface ITransactionStats {
    totalTransactions: number;
    totalRevenue: number;
    successRate: number;
    avgTransactionValue: number;
}

export interface ITransactionTableData {
    orderId: string;
    paymentId: string;
    amount: number;
    userId: string;
    receipt: string;
    userEmail: string;
    contact: string;
    method: string;
    transactionType: string;
    createdAt: Date;
}

export interface ITransactionDataWithPagination {
    tableData: ITransactionTableData[];
    pagination: IPagination;
}

export interface ITransactionHistory {
    transactionId: string;
    date: Date;
    amount: number;
    transactionType: TransactionType;

}
