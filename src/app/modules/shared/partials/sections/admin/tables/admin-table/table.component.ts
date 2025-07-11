import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ITable, ITableAction, ITableRow } from "../../../../../../../core/models/table.model";
import { CapitalizeFirstPipe } from "../../../../../../../core/pipes/capitalize-first.pipe";

@Component({    
    selector: 'app-admin-table-template',
    templateUrl: './table.component.html',
    imports: [CommonModule, CapitalizeFirstPipe]
})
export class AdminTableComponent {
    @Input({ required: true }) table!: ITable;
    @Output() adminTableActionEvent = new EventEmitter<{ action: string; row: any }>();

    actionsTriggered(action: ITableAction, row: ITableRow) {
        this.adminTableActionEvent.emit({ action: action.action, row });
    }
}