import { TransactionStatus } from "../enums/enums";
import { IPagination } from "./booking.model";

export interface ITransaction {
    id: string;
    userId: string;
    orderId: string;
    paymentId: string;
    signature: string;
    amount: number;
    currency: string;
    status: TransactionStatus
    method?: string;
    email?: string;
    contact?: string;
    receipt?: string;
    createdAt: Date;
    updatedAt: Date;
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
