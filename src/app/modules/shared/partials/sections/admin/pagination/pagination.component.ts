import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
    selector: 'app-admin-pagination',
    templateUrl: './pagination.component.html',
    imports: [CommonModule]
})
export class AdminPaginationComponent {
    currentPage = 1;
    rowsPerPage = 5; // Customize as needed
    tableData = { rows: [1, 2, 3, 4, 5] }

    get paginatedRows() {
        const start = (this.currentPage - 1) * this.rowsPerPage;
        const end = start + this.rowsPerPage;
        return this.tableData.rows.slice(start, end);
    }

    get totalPages() {
        return Math.ceil(this.tableData.rows.length / this.rowsPerPage);
    }
}