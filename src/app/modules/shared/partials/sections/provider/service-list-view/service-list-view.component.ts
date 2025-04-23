import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IOfferedService, ISubService, UpdateSubserviceType } from "../../../../../../core/models/offeredService.model";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-service-list-view",
    imports: [CommonModule],
    templateUrl: './service-list-view.component.html'
})
export class ServiceListViewComponent {
    @Input({ required: true }) offeredServices!: IOfferedService[];
    @Output() updateEvent = new EventEmitter<Partial<IOfferedService>>();
    @Output() updateSubServiceEvent = new EventEmitter<UpdateSubserviceType>();

    updateService(updateData: Partial<IOfferedService>) {
        this.updateEvent.emit(updateData);
    }

    updateSubservice(updateData: UpdateSubserviceType) {
        this.updateSubServiceEvent.emit(updateData);
    }
}