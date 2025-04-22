import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IOfferedService } from "../../../../../../core/models/offeredService.model";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-service-list-view",
    imports: [CommonModule],
    templateUrl: './service-list-view.component.html'
})
export class ServiceListViewComponent {
    @Input({ required: true }) offeredServices!: IOfferedService[];
    @Output() updateEvent = new EventEmitter<Partial<IOfferedService>>();

    updateService(updateData: Partial<IOfferedService>) {
        this.updateEvent.emit(updateData);
    }
}