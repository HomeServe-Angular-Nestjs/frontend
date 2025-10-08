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