import { Injectable } from "@angular/core";
import { SelectedServiceType } from "../../../modules/pages/customer/booking-1-pick-service/customer-pick-a-service.component";
import { IProviderService } from "../../models/provider-service.model";
import { BehaviorSubject, ReplaySubject } from "rxjs";

@Injectable({ providedIn: "root" })
export class SharedDataService {
    private selectedServiceIds: SelectedServiceType[] = [];
    private allServices: IProviderService[] = [];

    private _adminHeaderSubject = new BehaviorSubject<string>('Default Title');
    adminHeader$ = this._adminHeaderSubject.asObservable();

    private _providerHeaderSubject = new ReplaySubject<string>(2);
    providerHeader$ = this._providerHeaderSubject.asObservable();

    setSelectedServiceData(data: SelectedServiceType[]): void {
        this.selectedServiceIds = data;
    }

    getSelectedServiceData(): SelectedServiceType[] {
        return this.selectedServiceIds;
    }

    clearSelectedServiceData(): void {
        this.selectedServiceIds = [];
    }

    setAllServices(data: IProviderService[]): void {
        this.allServices = data;
    }

    getAllServices(): IProviderService[] {
        return this.allServices;
    }

    clearAllServices(): void {
        this.allServices = [];
    }

    setAdminHeader(newHeader: string) {
        this._adminHeaderSubject.next(newHeader);
    }

    setProviderHeader(newHeader: string) {
        this._providerHeaderSubject.next(newHeader);
    }
}