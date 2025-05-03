import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { IOfferedService, ISubService, UpdateSubserviceType } from "../../../../../../core/models/offeredService.model";
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
    @Output() updateEvent = new EventEmitter<Partial<IOfferedService>>();
    @Output() updateSubServiceEvent = new EventEmitter<UpdateSubserviceType>();

    updateService(updateData: Partial<IOfferedService>) {
        this.updateEvent.emit(updateData);
    }

    updateSubservice(updateData: UpdateSubserviceType) {
        this.updateSubServiceEvent.emit(updateData);
    }

    goToEditPage(index: number, id: string) {
        this._router.navigate(['provider', 'profiles', 'service_offered', 'edit', id], {
            queryParams: { subIdx: index }
        });
    }

    // deleteSub(id: string) {
    //     this.offeredServices = this.offeredServices.map((service: IOfferedService) => ({
    //         ...service,
    //         subService: service.subService.filter((sub: ISubService) => sub.id !== id)
    //     }));

    //     this._store.dispatch(offeredServiceActions.deleteSubService({ id }));
    // }
}