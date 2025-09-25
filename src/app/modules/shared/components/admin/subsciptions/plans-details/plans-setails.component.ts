import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IPlan } from "../../../../../../core/models/plan.model";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-admin-plan-details',
    templateUrl: './plans-details.component.html',
    imports: [CommonModule]
})
export class AdminPlanDetailsComponent {
    @Input({ required: true }) plan!: IPlan;
    @Output() closeModalEvent = new EventEmitter<string>();

    closeModal() {
        this.closeModalEvent.emit('close modal button clicked');
    }
}