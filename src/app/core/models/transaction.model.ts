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
  transactionId: string;
  paymentId: string | null;
  amount: number;
  method: string;
  source: PaymentSource,
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

export interface ITransactionFilter {
  search?: string;
  sort?: 'newest' | 'oldest' | 'high' | 'low';
  type?: TransactionType | 'all';
  date?: 'all' | 'last_six_months' | 'last_year';
  method?: PaymentDirection | 'all';
}

export interface ITransactionUserTableData {
  transactions: (ITransactionTableData & { email: string })[];
  pagination: IPagination;
}
