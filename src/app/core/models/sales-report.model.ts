// ----------------- Sales Report (Admin BI Dashboard) -----------------

export interface ISalesReportFilter {
    fromDate?: string;
    toDate?: string;
    professionId?: string;
    categoryId?: string;
    providerId?: string;
    bookingStatus?: string;
}

export interface ISalesSummary {
    totalBookings: number;
    totalSales: number;
    completedSales: number;
    cancelledSales: number;
    avgOrderValue: number;
    avgDailySales: number;
    salesGrowthPct: number;
}

export interface ISalesTrendPoint {
    label: string;
    revenue: number;
    bookings: number;
}

export interface IBookingsSoldBuckets {
    today: number;
    week: number;
    month: number;
    year: number;
}

export interface INamedMetric {
    name: string;
    bookings: number;
    revenue: number;
}

export interface ITopSellingService {
    providerId: string;
    providerName: string;
    serviceId: string;
    serviceName: string;
    profession: string;
    bookings: number;
    revenue: number;
    avgRating: number;
}

export interface IProviderPerformance {
    providerId: string;
    providerName: string;
    completedJobs: number;
    cancelled: number;
    revenue: number;
    completionRate: number;
    avgRating: number;
}

export interface ISalesDistributionPoint {
    name: string;
    value: number;
}

export interface ICancellationAnalysis {
    cancelledOrders: number;
    cancellationRate: number;
    topCancelledCategories: { name: string; bookings: number }[];
    topCancelledProviders: { name: string; bookings: number }[];
}

export interface ISalesFilterOptions {
    professions: { id: string; name: string }[];
    categories: { id: string; name: string }[];
    providers: { id: string; name: string }[];
}

export interface ISalesReportBundle {
    summary: ISalesSummary;
    trend: ISalesTrendPoint[];
    bookingsSold: IBookingsSoldBuckets;
    professions: INamedMetric[];
    categories: INamedMetric[];
    services: ITopSellingService[];
    providers: IProviderPerformance[];
    distribution: ISalesDistributionPoint[];
    cancellation: ICancellationAnalysis;
    filters: ISalesFilterOptions;
}

export interface IAdminOverViewCard {
    title: string;
    value: string;
    icon: string;
    iconBg?: string;
    subtext?: string;
}