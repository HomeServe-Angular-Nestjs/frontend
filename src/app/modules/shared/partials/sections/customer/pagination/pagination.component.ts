import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IPagination } from "../../../../../../core/models/booking.model";

@Component({
    selector: 'app-customer-pagination',
    templateUrl: './pagination.component.html',
    imports: [CommonModule]
})
export class CustomerPaginationComponent {
    @Input({ required: true }) pagination: IPagination = {
        page: 1,
        limit: 10,
        total: 1,
    };
    
    @Output() pageChanged = new EventEmitter<number>();

    currentPage = 1;
    totalPages = 1;
    pages: number[] = [];

    ngOnChanges(): void {
        if (this.pagination) {
            this.currentPage = this.pagination.page;
            this.totalPages = Math.ceil(this.pagination.total / this.pagination.limit);
            this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        }
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
            this.currentPage = page;
            this.pageChanged.emit(page);
        }
    }
}