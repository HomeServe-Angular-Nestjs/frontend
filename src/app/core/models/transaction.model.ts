import { TransactionStatus } from "../enums/enums";

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