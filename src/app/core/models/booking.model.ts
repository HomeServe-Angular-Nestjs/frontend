import { SelectedServiceIdsType } from "../../modules/pages/customer/booking-1-pick-service/customer-pick-a-service.component";
import { ISlotSource } from "./schedules.model";
import { Address } from "./user.model";

export interface IPriceBreakup {
    serviceId: string;
    subServiceIds: string[]
}

export interface IPriceBreakupData {
    subTotal: number;
    tax: number;
    visitingFee: number;
    total: number;
}

export type CustomerLocationType = Omit<Address, 'type'>;

export interface IBookingData {
    providerId: string;
    total: number;
    location: CustomerLocationType;
    slotData: ISlotSource;
    serviceIds: SelectedServiceIdsType[];
}