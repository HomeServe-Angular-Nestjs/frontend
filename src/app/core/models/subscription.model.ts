import { EntityState } from "@ngrx/entity";
import { PlanRoleType } from "./plan.model";

export type RenewalType = 'auto' | 'manual';
export type SubsDurationType = 'monthly' | 'yearly';
export type SubsPaymentStatus = 'pending' | 'paid' | 'failed';

export interface ISubscription {
    id: string;
    userId: string;
    transactionId: string;
    planId: string;

    name: string;
    duration: SubsDurationType;
    role: PlanRoleType;
    features: string[];

    startTime: string;
    endDate: string | null;
    isActive: boolean;
    isDeleted: boolean;

    renewalType?: RenewalType;
    paymentStatus?: SubsPaymentStatus;
    cancelledAt?: string;
    metadata?: Record<string, any>;
}

export interface ICreateSubscription {
    planId: string;
    transactionId: string;
    name: string;
    duration: SubsDurationType;
    role: PlanRoleType;
    features: string[];
    paymentStatus?: SubsPaymentStatus;
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