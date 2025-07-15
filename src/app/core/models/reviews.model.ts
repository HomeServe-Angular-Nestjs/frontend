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