export type VerificationStatusType = 'pending' | 'verified' | 'rejected';
export type UserBookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface IUserDetailsProfile {
    id: string;
    username: string;
    fullname: string;
    email: string;
    phone: string;
    avatar: string;
    isActive: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface IProviderDetailsProfile extends IUserDetailsProfile {
    profession: string;
    experience: number;
    bio: string;
    verificationStatus: VerificationStatusType;
}

export interface IAddressDetail {
    label: string;
    address: string;
    city?: string;
    state?: string;
    postalCode?: string;
    coordinates?: [number, number];
    isDefault: boolean;
}

export interface ICustomerStatistics {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalAmountSpent: number;
    reviewsWritten: number;
}

export interface IProviderStatistics {
    activeServices: number;
    totalBookings: number;
    completedJobs: number;
    cancelledJobs: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
}

export interface IBookingParty {
    id: string;
    username: string;
    fullname?: string;
    avatar?: string;
    profession?: string;
}

export interface IBookingOverview {
    bookingId: string;
    provider: IBookingParty;
    customer: IBookingParty;
    service: {
        name?: string;
        category?: string;
    };
    amount: number;
    status: UserBookingStatus;
    date: string | Date;
}

export interface IReviewOverview {
    reviewId: string;
    user: IBookingParty;
    rating: number;
    desc: string;
    date: string | Date;
}

export interface IProviderServiceOverview {
    serviceId: string;
    service: string;
    category: string;
    price: number;
    pricingUnit: 'hour' | 'day';
    isActive: boolean;
    totalBookings: number;
}

export interface IDayAvailability {
    day: string;
    isAvailable: boolean;
    timeRanges: {
        startTime: string;
        endTime: string;
    }[];
}

export interface IVacationView {
    isOnVacation: boolean;
    days: {
        date: string;
        reason?: string;
    }[];
}

export interface IAvailabilityOverview {
    days: IDayAvailability[];
    vacation: IVacationView;
}

export interface IDocumentDetail {
    id: string;
    label: string;
    fileUrl: string;
    uploadedAt: string | Date;
    verificationStatus: VerificationStatusType;
}

export interface ICustomerDetailsBundle {
    profile: IUserDetailsProfile;
    statistics: ICustomerStatistics;
    addresses: IAddressDetail[];
    recentBookings: IBookingOverview[];
    reviews: IReviewOverview[];
}

export interface IProviderDetailsBundle {
    profile: IProviderDetailsProfile;
    statistics: IProviderStatistics;
    services: IProviderServiceOverview[];
    availability: IAvailabilityOverview;
    documents: IDocumentDetail[];
    recentBookings: IBookingOverview[];
    reviews: IReviewOverview[];
}