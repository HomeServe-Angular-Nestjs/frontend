export type PricingUnitType = 'hour' | 'day';

export interface IProviderService {
    id: string;
    providerId: string;
    profession: {
        id: string;
        name: string;
    }
    category: {
        id: string;
        name: string;
    };
    description: string;
    price: number;
    pricingUnit: PricingUnitType;
    image: string;
    estimatedTimeInMinutes: number;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IProviderServiceFilter {
    search?: string;
    status?: string;
    sort?: string;
    page?: number;
    limit?: number;
}
