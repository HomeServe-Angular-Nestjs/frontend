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