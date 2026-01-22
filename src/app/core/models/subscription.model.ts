import { PlanFeatures, PlanName, PlanRoleType } from "./plan.model";
import { PaymentStatus, PlanDuration } from "../enums/enums";
import { IPagination } from "./booking.model";

export type RenewalType = 'auto' | 'manual';
export type SubscriptionStatusType = 'active' | 'expired' | 'inactive';


export interface ISubscription {
    id: string;
    userId: string;
    transactionId: string;
    planId: string;

    name: string;
    duration: PlanDuration;
    role: PlanRoleType;
    features: PlanFeatures;
    price: number;

    startTime: string;
    endDate: string | null;
    isActive: boolean;
    isDeleted: boolean;

    renewalType?: RenewalType;
    paymentStatus?: PaymentStatus;
    cancelledAt?: string;
    metadata?: Record<string, any>;
}

export interface ICreateSubscription {
    planId: string;
    duration: PlanDuration;
}

export interface ISubscriptionState {
    selectedSubscription: ISubscription | null;
    error: string | null;
    showSubscriptionPage: boolean;
}

export interface IAdminDashboardSubscription {
    free: number;
    totalPremium: number;
    monthlyPremium: number;
    yearlyPremium: number;
    totalProviders: number;
}

export interface IAdminDashboardRevenue {
    amount: number;
    date: string;
}

export interface IUpdateSubscriptionPaymentStatus {
    transactionId: string;
    paymentStatus: PaymentStatus;
    subscriptionId: string;
}

export interface IAdminSubscriptionList {
    subscriptionId: string;
    user: {
        email: string;
        role: 'provider' | 'customer';
    };
    plan: {
        name: string;
        duration: PlanDuration;
    };
    amount: number;
    status: SubscriptionStatusType;
    isActive: boolean;
    paymentStatus: PaymentStatus;
    validity: {
        start: string;
        end: string;
    };
    renewalType?: RenewalType;
}

export interface IAdminFilteredSubscriptionListWithPagination {
    subscriptions: IAdminSubscriptionList[];
    pagination: IPagination;
}

export interface ISubscriptionFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: SubscriptionStatusType | 'all';
    payment?: PaymentStatus | 'all';
    duration?: PlanDuration | 'all';
}