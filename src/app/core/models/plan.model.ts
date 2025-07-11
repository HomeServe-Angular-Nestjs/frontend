export type PlanDurationType = 'monthly' | 'yearly' | 'lifetime';
export type PlanRoleType = 'customer' | 'provider';

export interface IPlan {
    id: string;
    name: string;
    price: number;
    role: PlanRoleType;
    duration: PlanDurationType;
    features: string[];
    isActive: boolean;
    createdAt: Date;
}

export interface ISavePlan {
    name: string;
    price: number;
    role: PlanRoleType;
    duration: PlanDurationType;
    features: string[];
}

export interface IUpdatePlan extends ISavePlan {
    id: string;
}

export interface IUpdatePlanStatus {
    id: string;
    status: boolean;
}