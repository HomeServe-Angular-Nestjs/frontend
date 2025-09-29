import { PlanRoleType } from "./plan.model";
import { PaymentStatus, PlanDuration } from "../enums/enums";

export type RenewalType = 'auto' | 'manual';

export interface ISubscription {
    id: string;
    userId: string;
    transactionId: string;
    planId: string;

    name: string;
    duration: PlanDuration;
    role: PlanRoleType;
    features: string[];

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
    transactionId: string | null;
    name: string;
    duration: PlanDuration;
    role: PlanRoleType;
    features: string[];
    paymentStatus?: PaymentStatus;
    startTime: string;
    endDate: string | null;
    price: number;
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
}

export interface IUpdateSubscriptionPaymentStatus {
    transactionId: string;
    paymentStatus: PaymentStatus;
    subscriptionId: string;
}