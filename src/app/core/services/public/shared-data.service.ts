import { Injectable } from "@angular/core";
import { SelectedServiceType } from "../../../modules/pages/customer/booking-1-pick-service/customer-pick-a-service.component";
import { IOfferedService } from "../../models/offeredService.model";

@Injectable({ providedIn: "root" })
export class SharedDataService {
    private selectedServiceIds: SelectedServiceType[] = [];
    private allServices: IOfferedService[] = [];

    setSelectedServiceData(data: SelectedServiceType[]): void {
        this.selectedServiceIds = data;
    }

    getSelectedServiceData(): SelectedServiceType[] {
        return this.selectedServiceIds;
    }

    clearSelectedServiceData(): void {
        this.selectedServiceIds = [];
    }

    setAllServices(data: IOfferedService[]): void {
        this.allServices = data;
    }

    getAllServices(): IOfferedService[] {
        return this.allServices;
    }

    clearAllServices(): void {
        this.allServices = [];
    }
}