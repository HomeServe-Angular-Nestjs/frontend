import { IPagination } from "./booking.model";

export interface IProfession {
    id: string;
    name: string;
    isActive: boolean;
}

export interface IProfessionFilter {
    search?: string;
    isActive?: string;
    page?: number;
    limit?: number;
}

export interface IServiceCategory {
    id: string;
    name: string;
    professionId: string;
    keywords: string[];
    isActive: boolean;
    isDeleted: boolean;
}

export interface IServiceCategoryWithPagination {
    services: IServiceCategory[];
    pagination: IPagination;
}

export interface IServiceCategoryFilter extends IProfessionFilter {
    profession?: string;
}