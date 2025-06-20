import { EntityState } from '@ngrx/entity';
import { ISlot, SlotType } from './schedules.model';
import { IPagination } from './booking.model';

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

export type Address = {
    type: 'point',
    address: string
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
    avatar?: string;
    googleId?: string;
    isActive: boolean
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICustomer extends IBaseUser {
    locations?: Address[];
    savedProviders?: string[];
}

export type VerificationStatusType = 'pending' | 'verified' | 'rejected';

export interface IProvider extends IBaseUser {
    bio?: string;
    expertise?: IExpertise[];
    additionalSkills?: string[];
    languages?: ILanguage[];
    location?: Address;
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

export interface UsersViewModel {
    customerTable: {
        columns: string[];
        rows: any[];

    },
    providerTable: {
        columns: string[];
        rows: any[];
    }
}

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