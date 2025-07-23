export interface IReview {
    reviewedBy: string;
    service: string;
    desc: string;
    rating: number;
    writtenAt: Date | string;
}

export interface ISubmitReview {
    providerId: string;
    desc: string;
    ratings: number;
}

export interface IAdminReviewData {
    reviewId: string;
    reviewedBy: {
        customerId: string;
        customerName: string;
        customerEmail: string;
        customerAvatar: string;
    };
    providerId: string;
    providerName: string;
    providerEmail: string;
    providerAvatar: string;
    isReported: boolean;
    desc: string;
    rating: number;
    writtenAt: Date;
    isActive: boolean;
}

export interface PaginatedReviewResponse {
    reviews: IAdminReviewData[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export type SortByRatingType = 'latest' | 'oldest' | 'highest' | 'lowest';
export type SearchByReviewType = 'review id' | 'provider' | 'content';

export interface IReviewFilters {
    minRating?: string;
    sortBy?: SortByRatingType;
    search?: string;
    searchBy?: SearchByReviewType;
    page?: number;
}