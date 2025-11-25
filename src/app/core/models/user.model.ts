import { EntityState } from '@ngrx/entity';
import { SlotType } from './schedules.model';
import { IPagination, IReview } from './booking.model';
export type UType = 'customer' | 'provider';

export interface IDocs {
    id: string;
    label: string;
    fileUrl: string;
    uploadedAt: Date;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    verifiedAt?: Date;
    isDeleted: boolean;
};

export interface ILocation {
    type: 'point',
    coordinates: [number, number];
};

export interface IExpertise {
    specialization: string;
    label: string;
};

export interface ILanguage {
    language: string;
    proficiency: string;
}

export type Day = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thur' | 'Fri' | 'Sat';

export type Availability = {
    day: {
        from: Day,
        to: Day,
    },
    time: {
        from: string,
        to: string
    }
}

export interface IBaseUser {
    id: string;
    fullname?: string;
    email: string;
    username: string;
    password?: string;
    phone?: string;
    avatar: string;
    googleId?: string;
    location?: ILocation;
    address: string;
    isActive: boolean
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICustomer extends IBaseUser {
    savedProviders?: string[];
    isReviewed: boolean;
}

export type VerificationStatusType = 'pending' | 'verified' | 'rejected';

export interface IProvider extends IBaseUser {
    bio?: string;
    expertise?: IExpertise[];
    additionalSkills?: string[];
    languages?: ILanguage[];
    workImages?: string[];
    awards?: string[];
    isCertified: boolean;
    docs: IDocs[];
    schedules: string[];
    subscriptionID: string;
    profession: string;
    serviceRadius?: number;
    enableSR: boolean;
    bookingLimit: number | null;
    bufferTime: number | null;
    experience: number;
    availability: Availability;
    servicesOffered: string[];
    defaultSlots: SlotType[];
    verificationStatus: VerificationStatusType;
    avgRating: number;
}

export interface IUserState {
    customers: EntityState<ICustomer>;
    providers: EntityState<IProvider>;
    loading: boolean;
    error: string | null;
}

export interface IProviderState {
    provider: IProvider | null;
    loading: boolean;
    error: string | null;
}

export interface ICustomerState {
    customer: ICustomer | null;
    loading: boolean;
    error: string | null;
}

export type UsersType = ICustomer[] | IProvider[];

export type UserUpdationType = Partial<ICustomer> | Partial<IProvider>;

export interface IUserData {
    id: string;
    username: string;
    email: string;
    contact: string;
    createdAt: Date;
    isActive: boolean;
    isBlocked: boolean;
    isDeleted: boolean;
}

export interface IUserDataWithPagination {
    data: IUserData[],
    pagination: IPagination
}

export interface IUpdateUserStatus {
    action: string,
    status: boolean;
    userId: string;
    role: UType;
}

export interface IRemoveData {
    userId: string;
    role: UType;
}

export interface IProviderUpdateBio {
    providerBio?: string;
    expertises?: IExpertise[];
    additionalSkills?: string[];
    languages?: ILanguage[];
}


export interface IVerificationStatusMetrics {
    count: number;
    percentage: string;
}

export interface IApprovalOverviewData {
    pending: IVerificationStatusMetrics;
    verified: IVerificationStatusMetrics;
    rejected: IVerificationStatusMetrics;
}

export interface IApprovalTableDetails {
    id: string;
    avatar: string;
    name: string;
    email: string;
    documentCount: number;
    date: Date;
    verificationStatus: VerificationStatusType
}

export interface ICustomerProfileData {
    fullname: string;
    username: string;
    phone: string;
    address: string;
    coordinates: [number, number];
}

export interface IChangePassword {
    newPassword: string;
    currentPassword: string;
}

interface IDisplayReviewItem extends IReview {
    name: string;
    avatar: string;
    email: string;
}

export interface IDisplayReviews {
    reviews: IDisplayReviewItem[];
    avgRating: number;
    totalReviews: number;
    allFetched: boolean;
}

export interface ISearchedLocation {
    address: string;
    coordinates: { lat: number, lng: number };
}

export interface IHomeSearch {
    title?: string | null;
    lat?: number | null,
    lng?: number | null;
}

export interface IFilterFetchProviders extends IHomeSearch {
    search?: string;
    isCertified?: boolean;
    status?: string;
    page?: number;
}

export interface IStats {
    new: number;
    total: number;
    active: number;
}

export interface IAdminDashboardUserStats {
    customer: IStats;
    provider: IStats;
}

export interface ITopProviders {
    totalEarnings: number;
    providerId: string;
    username: string;
    email: string;
}

export interface IProviderCardView {
    id: string;
    fullname: string;
    username: string;
    isCertified: boolean;
    avgRating: number;
    totalReviews: number;
    experience: number;
    profession: string;
    address: string;
    isActive: boolean;
    avatar: string;
}

export interface IProviderCardWithPagination {
    providerCards: IProviderCardView[];
    pagination: IPagination;
}