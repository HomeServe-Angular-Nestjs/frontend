import { EntityState } from '@ngrx/entity';
import { ISlot } from './schedules.model';



export type AdditionalDocs = {
    type: string;
    fileUrl: string;
    uploadedAt: Date;
}

export type Verification = {
    pcc: {
        fileUrl: string;
        uploadedAt: Date;
    };
    additionalDocs: AdditionalDocs[];
    verificationStatus: 'pending' | 'verified' | 'rejected';
    verifiedAt?: Date;
};

export type Address = {
    type: 'point',
    address: string
    coordinates: [number, number];
};

export type Expertise = {
    specialization: string;
    label: string;
    tag: string;
};

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
    isBlocked: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICustomer extends IBaseUser {
    locations?: Address[];
    savedProviders?: string[];
}

export interface IProvider extends IBaseUser {
    bio?: string;
    expertise?: Expertise[];
    additionalSkills?: string[];
    languages?: string[];
    location?: Address;
    workImages?: string[];
    awards?: string[];
    isCertified: boolean;
    verification: Verification;
    schedules: string[];
    subscriptionID: string;
    profession: string;
    serviceRadius?: number;
    experience: number;
    availability: Availability;
    servicesOffered: string[];
    defaultSlots: Omit<ISlot, 'takenBy'>[];
}

export interface IUserState {
    customers: EntityState<ICustomer>;
    providers: EntityState<IProvider>;
    loading: boolean;
    error: string | null;
}

export interface ICustomerState {
    customers: EntityState<ICustomer>;
    loading: boolean;
    error: string | null;
}

export interface IProviderState {
    provider: IProvider | null;
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