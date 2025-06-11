import { EntityState } from "@ngrx/entity";

export interface ISubService {
    id: string;
    title: string;
    desc: string;
    price: string;
    estimatedTime: string;
    availability: string;
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

export interface IToggleServiceStatus {
    id: string;
    isActive: boolean;
}

export type UpdateSubserviceType = { id: string, subService: Partial<ISubService> };

export interface IUpdateSubservice {
    id: string;
    subService: IToggleServiceStatus;
};
