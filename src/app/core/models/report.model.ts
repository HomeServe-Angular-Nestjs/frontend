import { ReportStatus } from "../enums/enums";
import { IPagination } from "./booking.model";

export type ReportedType = 'customer' | 'provider' | 'review';

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
    investigationNotes?: string;
    resolutionNote?: string;
    resolvedAt?: string;
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

export interface IReportTargetSummary {
    total: number;
    pending: number;
    resolved: number;
    rejected: number;
}

export interface IReportBookingInfo {
    bookingId: string;
    createdAt: Date | string;
    bookingStatus: string;
    totalAmount: number;
    hasReview: boolean;
}

export interface IReportReviewInfo {
    desc: string;
    rating: number;
    writtenAt: Date | string;
    isReported: boolean;
    isActive: boolean;
    serviceCount: number;
    bookingReference: string;
}

export interface IReportRelated {
    targetProfile?: {
        id: string;
        name: string;
        email: string;
        avatar: string;
        role: 'customer' | 'provider';
    };
    recentBookings?: IReportBookingInfo[];
    review?: IReportReviewInfo;
}

export interface IReportDetail {
    id: string;
    reportedBy: {
        reportedId: string;
        name: string;
        email: string;
        avatar: string;
        role: 'customer' | 'provider';
    };
    target: {
        targetId: string;
        name: string;
        email: string;
        avatar: string;
        role: 'customer' | 'provider';
    };
    type: ReportedType;
    reason: string;
    status: ReportStatus;
    description: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    resolvedAt?: Date | string;
    investigationNotes?: string;
    resolutionNote?: string;
    related?: IReportRelated;
    previousReports?: IReportTargetSummary;
}

export interface IReportOverViewMatrix {
    total: number;
    pending: number;
    resolved: number;
    rejected: number;
    flagged: number;
}