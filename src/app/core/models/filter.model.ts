export type ToggleType = true | false | 'all';

export type SortOption =
    | 'price-asc'
    | 'price-desc'
    | 'duration-asc'
    | 'duration-desc';
    
export interface IPriceRange {
    min?: number;
    max?: number;
}

export interface IServiceDurationRange {
    minHours?: number;
    maxHours?: number;
}

export type ServiceDurationKey = "Quick Service" | "Half Day" | "Full Day" | "Multi-day";

export interface IFilter {
    search?: string;
    status?: ToggleType;
    isCertified?: boolean;
    sort?: SortOption;
    category?: string;
    priceRange?: IPriceRange;
    duration?: IServiceDurationRange;
};
