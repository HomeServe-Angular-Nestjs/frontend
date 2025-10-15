// ----------- Performance Analytics Models ------------

export interface IOverviewCard<T> {
    label: string;
    valueKey: keyof T;
    icon: string;
    iconColor: string;
    badge: string;
    badgeColor: string;
    unit?: string;
    description: string;
}

export interface IProviderPerformanceOverview {
    avgResponseTime: number;
    onTimePercent: number;
    avgRating: number;
    completionRate: number;
}

export interface IBookingPerformanceData {
    month: string;
    completed: number;
    cancelled: number;
    total: number;
}

export interface IReviewChartData {
    distributions: {
        rating: number;
        count: number;
    }[];
    reviews: {
        name: string;
        desc: string;
        rating: number;
    }[];
}

export interface IResponseTimeChartData {
    name: string;
    count: number;
}

export interface IOnTimeArrivalChartData {
    month: string;
    percentage: number;
}

export interface IDisputeData {
    disputeType: string;
    data: number[];
}

export interface IDisputeAnalyticsChartData {
    month: string;
    other: number;
    harassment: number;
    spam: number;
    inappropriate: number;
}

export interface IComparisonOverviewData {
    growthRate: number;
    monthlyTrend: {
        previousMonth: number;
        currentMonth: number;
        previousRevenue: number;
        currentRevenue: number;
        growthPercentage: number;
    };
    providerRank: number;
}

export interface IComparisonChartData {
    month: string;
    performance: number;
    platformAvg: number;
}

// ----------- Revenue Analytics Models ------------
export type RevenueChartView = 'monthly' | 'quarterly' | 'yearly';

export interface IProviderRevenueOverview {
    totalRevenue: number;
    revenueGrowth: number;
    completedTransactions: number;
    avgTransactionValue: number;
}

export interface IRevenueTrendData {
    providerRevenue: number[];
    platformAvg: number[];
    labels: string[];
}