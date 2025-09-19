import { ReportStatus } from "../enums/enums";
import { IPagination } from "./booking.model";

export type ReportedType = 'customer' | 'provider';

export interface IReport {
    id: string;
    reportedId: string;
    targetId: string;
    type: ReportedType;
    reason: string;
    description: string;
    status: ReportStatus;
    createdAt: string;
    updatedAt: string;
}

export interface IReportFilter {
    page?: number;
    search?: string;
    status?: ReportStatus | string;
    type?: ReportStatus | string;
}
export interface IReportWithPagination {
    reports: IReport[];
    pagination: IPagination;
}

export interface IReportDetail {
    id: string;
    reportedBy: {
        reportedId: string;
        name: string;
        email: string;
        avatar: string;
    };
    target: {
        targetId: string;
        name: string;
        email: string;
        avatar: string;
    };
    type: ReportedType;
    reason: string;
    status: ReportStatus;
    description: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface IReportOverViewMatrix {
    total: number;
    pending: number;
    resolved: number;
    rejected: number;
    flagged: number;
    in_progress: number;
}