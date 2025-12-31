import { IProviderService } from "./provider-service.model";

export type SelectedServiceType = {
    id: string,
    name: string,
    services: IProviderService[]
};

export type SelectedServiceIdsType = {
    id: string,
    selectedIds: string[]
};

export interface ICart {
    id: string;
    customerId: string;
    items: string[];
}

export interface ICartUI extends Omit<ICart, 'items'> {
    items: IProviderService[];
}