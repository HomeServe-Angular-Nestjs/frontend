import { EntityState } from "@ngrx/entity";

export interface ISubService {
    id: string;
    title: string;
    desc: string;
    price: string;
    estimatedTime: string;
    tag: string;
    image: string;
    isActive: boolean;
    isDeleted: boolean;
}

export interface IOfferedService {
    id: string
    title: string;
    desc: string;
    image: string;
    subService: ISubService[];
    isActive: boolean;
    isDeleted: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IOfferedServiceState {
    offeredServices: EntityState<IOfferedService>;
    loading: boolean;
    error: string | null;
}