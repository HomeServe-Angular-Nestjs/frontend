import { CommonModule } from '@angular/common';
import { Component, Input, TemplateRef } from '@angular/core';
import { TableRowComponent } from "../row/table-row.component";

@Component({
    selector: 'app-table-wrapper',
    templateUrl: './table-wrapper.component.html',
    imports: [CommonModule, TableRowComponent]
})
export class TableWrapperComponent {
    @Input() row: any[] = [];
    @Input() cellTemplates: { [key: string]: TemplateRef<any> } = {};
}
