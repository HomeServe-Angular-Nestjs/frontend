import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IPagination } from "../../../../../../core/models/booking.model";

@Component({
    selector: 'app-admin-pagination',
    templateUrl: './pagination.component.html',
    imports: [CommonModule]
})
export class AdminPaginationComponent {
    @Input({ required: true }) pagination!: IPagination;
    @Output() pageChange = new EventEmitter<number>();

    get currentPage() {
        return this.pagination?.page;
    }

    get totalPages(): number {
        return Math.ceil(this.pagination?.total / this.pagination?.limit);
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.pageChange.emit(this.currentPage + 1);
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.pageChange.emit(this.currentPage - 1);
        }
    }
}