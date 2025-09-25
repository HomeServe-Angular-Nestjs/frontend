export type PlanDurationType = 'monthly' | 'yearly' | 'lifetime';
export type PlanRoleType = 'customer' | 'provider';
export type PlanName = 'free' | 'premium';

export interface IPlan {
    id: string;
    name: string | PlanName;
    price: number;
    role: PlanRoleType;
    duration: PlanDurationType;
    features: string[];
    isActive: boolean;
    createdAt: Date;
}

export interface IUpdatePlanStatus {
    id: string;
    status: boolean;
}