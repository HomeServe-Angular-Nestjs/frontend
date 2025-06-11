import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { IOfferedService, ISubService, IToggleServiceStatus, IUpdateSubservice } from "../../../../../../core/models/offeredService.model";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { Store } from "@ngrx/store";
import { offeredServiceActions } from "../../../../../../store/offered-services/offeredService.action";

@Component({
    selector: "app-service-list-view",
    imports: [CommonModule, RouterLink],
    templateUrl: './service-list-view.component.html'
})
export class ServiceListViewComponent {
    private _router = inject(Router);
    private _store = inject(Store);

    @Input({ required: true }) offeredServices!: IOfferedService[];
    @Output() updateEvent = new EventEmitter<IToggleServiceStatus>();
    @Output() updateSubServiceEvent = new EventEmitter<IUpdateSubservice>();

    expandedSubServices: Record<string, boolean> = {};

    updateService(updateData: IToggleServiceStatus) {
        this.updateEvent.emit(updateData);
    }

    updateSubservice(updateData: IUpdateSubservice) {
        console.log(updateData)
        this.updateSubServiceEvent.emit(updateData);
    }

    goToEditPage(index: number, id: string) {
        this._router.navigate(['provider', 'profiles', 'service_offered', 'edit', id], {
            queryParams: { subIdx: index }
        });
    }

    addSubService(id: string) {
        this._router.navigate(['provider', 'profiles', 'service_offered', 'edit', id], {
            queryParams: { addSs: true }
        });
    }

    deleteSub(serviceId: string, subId: string) {
        // this.offeredServices = this.offeredServices.map((service: IOfferedService) => ({
        //     ...service,
        //     subService: service.subService.filter((sub: ISubService) => sub.id !== subId)
        // }));

        this._store.dispatch(offeredServiceActions.updateSubService({
            updateData: {
                id: serviceId,
                subService: { id: subId, isDeleted: true }
            }
        }));
    }

    toggleSub(serviceId: string): void {
        this.expandedSubServices[serviceId] = !this.expandedSubServices[serviceId];
    }
}