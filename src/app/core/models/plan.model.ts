import { PlanDuration } from "../enums/enums";

export type PlanRoleType = 'customer' | 'provider';
export type PlanName = 'free' | 'premium';

export interface IPlan {
    id: string;
    name: string | PlanName;
    price: number;
    role: PlanRoleType;
    duration: PlanDuration;
    features: string[];
    isActive: boolean;
    createdAt: Date;
}

export interface IUpdatePlanStatus {
    id: string;
    status: boolean;
}