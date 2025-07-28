import { CommonModule } from "@angular/common";
import { Component, Input, TemplateRef } from "@angular/core";
import { TableColComponent } from "../column/table-column.component";

@Component({
    selector: 'app-table-row',
    imports: [CommonModule, TableColComponent],
    template: `
    <tr class="border-b hover:bg-blue-50/30 transition-shadow">
      <app-table-col *ngFor="let cell of row" [cell]="cell"></app-table-col>
    </tr>
  `,
})
export class TableRowComponent {
    @Input() row: any = [];
}
