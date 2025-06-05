import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { IPagination } from "../../../../../../core/models/booking.model";

@Component({
    selector: 'app-provider-pagination',
    templateUrl: './provider-pagination.component.html',
    imports: [CommonModule]
})
export class ProviderPaginationComponent implements OnChanges {
    @Input() pagination!: IPagination;
    @Output() pageChange = new EventEmitter<number>();

    currentPage: number = 1;
    totalPages: number = 1;
    startItem: number = 0;
    endItem: number = 0;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['pagination'] && this.pagination) {
            this.currentPage = this.pagination.page;
            this.totalPages = Math.ceil(this.pagination.total / this.pagination.limit);
            this.calculateItemRange();
        }
    }

    calculateItemRange() {
        this.startItem = (this.currentPage - 1) * this.pagination.limit + 1;
        this.endItem = Math.min(this.startItem + this.pagination.limit - 1, this.pagination.total);
    }

    get pageRange(): (number | '...')[] {
        const delta = 2;
        const range: (number | '...')[] = [];

        const left = Math.max(2, this.currentPage - delta);
        const right = Math.min(this.totalPages - 1, this.currentPage + delta);

        range.push(1);
        if (left > 2) range.push('...');
        for (let i = left; i <= right; i++) {
            range.push(i);
        }
        if (right < this.totalPages - 1) range.push('...');
        if (this.totalPages > 1) range.push(this.totalPages);
        return range;
    }

    goToPage(page: number): void {
        if (typeof page === 'number' && page !== this.currentPage) {
            this.pageChange.emit(page);
        }
    }

    prev(): void {
        if (this.currentPage > 1) {
            this.pageChange.emit(this.currentPage - 1);
        }
    }

    next(): void {
        if (this.currentPage < this.totalPages) {
            this.pageChange.emit(this.currentPage + 1);
        }
    }
}