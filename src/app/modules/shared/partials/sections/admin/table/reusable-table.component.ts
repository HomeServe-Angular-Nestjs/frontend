import { CommonModule } from '@angular/common';
import { Component, Input, TemplateRef } from '@angular/core';

export interface TableColumn {
    label: string;
    key: string;
    type?: 'text' | 'status' | 'tags' | 'template';
    template?: TemplateRef<any>; // For 'template' type specific columns if passed directly (harder from parent html)
    // or we use a separate input for templates mapping
}

@Component({
    selector: 'app-admin-simple-table',
    templateUrl: './reusable-table.component.html', 
    standalone: true,
    imports: [CommonModule]
})
export class AdminSimpleTableComponent {
    @Input() data: any[] = [];
    @Input() columns: TableColumn[] = [];
    @Input() isLoading = false;
    @Input() noDataMessage = 'No records found.';

    // Allow passing templates for specific columns key
    @Input() templates: { [key: string]: TemplateRef<any> } = {};

    // For keys that might be nested or need safe access (though basic key access is usually fine)
    getCellValue(row: any, key: string): any {
        return row[key];
    }
}
