import { BookingStatus } from "../enums/enums";

export type ReportCategoryType = 'booking' | 'users' | 'transactions' | 'subscription';

export interface IFilterConfig {
    type: 'select' | 'text' | 'date' | 'checkbox';
    name: string;
    label: string;
    desc?: string;
    options?: string[];
    placeholder?: string;
    dependsOn?: {
        name: string;
        value: string;
    };
}

interface IReportDownloadData {
    category: ReportCategoryType;
    fromDate: Date;
    toDate: Date;
}

export interface IReportDownloadBookingData extends IReportDownloadData {
    userId: string;
    status: BookingStatus;
}

export interface IReportDownloadUserData extends IReportDownloadData {
    status: 'active' | 'blocked';
    role: 'provider' | 'customer';
}

export interface IReportDownloadTransactionData extends IReportDownloadData {
    method: string;
    type: string;
}