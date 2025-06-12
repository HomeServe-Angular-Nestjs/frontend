import { EntityState } from "@ngrx/entity";
import { IPagination } from "./booking.model";
import { ServiceSort } from "../enums/enums";
import { ToggleType } from "./filter.model";

export type ServiceToggleType = 'true' | 'false' | 'all';

export interface ISubService {
    id: string;
    title: string;
    desc: string;
    price: string;
    estimatedTime: string;
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

export interface IServicesWithPagination {
    services: IOfferedService[];
    pagination: IPagination;
}

export interface IServiceFilter {
    status?: ServiceToggleType;
    isVerified?: ServiceToggleType;
    sort?: ServiceSort;
    search?: string;
}
