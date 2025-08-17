export interface IWallet {
    id: string;
    userId: string;
    currency: string;
    balance: number;
    createdAt: string;
    lastTransactionDate: Date;
}