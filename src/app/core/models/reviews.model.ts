import { IPagination, IReview } from "./booking.model";

export interface ISubmitReview {
  description: string;
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


export interface IReviewDetails extends IReview {
  avatar: string;
  email: string;
  username: string;
  serviceTitles: string[];
}

export interface IReviewWithPagination {
  reviewDetails: IReviewDetails[];
  pagination: IPagination;
}

export interface IReviewFilter {
  search?: string;
  rating?: 'all' | 1 | 2 | 3 | 4 | 5;
  sort?: 'asc' | 'desc';
  time?: "all" | "last_6_months" | "last_year";
}
