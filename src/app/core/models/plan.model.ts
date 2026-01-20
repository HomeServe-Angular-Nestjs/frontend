import { PlanDuration } from "../enums/enums";

export type PlanRoleType = 'customer' | 'provider';
export type PlanName = 'free' | 'premium';
export type FeatureType = 'boolean' | 'number' | 'enum';
export type FeatureValue = boolean | number | string;

export type FeatureKey = keyof typeof FEATURE_REGISTRY;
export type PlanFeatures = Partial<Record<string, FeatureValue>>;
export type ICreatePlan = Omit<IPlan, 'id' | 'createdAt'>;

export interface IPlan {
    id: string;
    name: string | PlanName;
    price: number;
    role: PlanRoleType;
    duration: PlanDuration;
    features: PlanFeatures;
    isActive: boolean;
    createdAt: Date;
}

export interface FeatureDefinition {
    readonly key: string;
    readonly type: FeatureType;
    readonly label: string;
    readonly values?: readonly string[];
}

export const FEATURE_REGISTRY: Record<string, FeatureDefinition> = {
    BASIC_SUPPORT: {
        key: 'basic_support',
        type: 'boolean',
        label: 'Basic Support'
    },
    SERVICE_LISTING_LIMIT: {
        key: 'service_listing_limit',
        type: 'number',
        label: 'Service Listing Limit'
    },
    ANALYTICS_DASHBOARD: {
        key: 'analytics_dashboard',
        type: 'boolean',
        label: 'Analytics Dashboard'
    },
    SEARCH_PRIORITY: {
        key: 'search_priority',
        type: 'enum',
        label: 'Search Priority',
        values: ['low', 'medium', 'high']
    }
};

export interface IUpdatePlanStatus {
    id: string;
    status: boolean;
}