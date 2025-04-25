import { Injectable } from "@angular/core";
import { SelectedServiceType } from "../../../modules/pages/customer/booking-1-pick-service/customer-pick-a-service.component";

@Injectable({ providedIn: "root" })
export class SharedDataService {
    private selectedServiceIds: SelectedServiceType[] = [];

    setSelectedServiceData(data: SelectedServiceType[]): void {
        this.selectedServiceIds = data;
    }

    getSelectedServiceData(): SelectedServiceType[] {
        return this.selectedServiceIds;
    }

    clearSelectedServiceData(): void {
        this.selectedServiceIds = [];
    }

}