import { CommonModule } from "@angular/common";
import { Component, Input, TemplateRef } from "@angular/core";

@Component({
    selector: 'app-table-col',
    imports: [CommonModule],
    template: `
    <td class="px-5 py-3">
        {{ cell.value }}
    </td>
  `,
})
export class TableColComponent {
    @Input() cell!: any;
}
