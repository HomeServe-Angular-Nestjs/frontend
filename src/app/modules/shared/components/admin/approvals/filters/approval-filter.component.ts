import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";

export interface ApprovalFilter {
    search: string;
    status: string;
    date: string;
}

@Component({
    selector: 'app-admin-approval-filter',
    templateUrl: './approval-filter.component.html',
    imports: [CommonModule, FormsModule],
})
export class AdminApprovalFilterComponent {
    @Output() filterChange = new EventEmitter<ApprovalFilter>();

    search: string = '';
    status: string = '';
    date: string = '';

    emit(): void {
        this.filterChange.emit({ search: this.search, status: this.status, date: this.date });
    }

    clear(): void {
        this.search = '';
        this.status = '';
        this.date = '';
        this.emit();
    }
}
