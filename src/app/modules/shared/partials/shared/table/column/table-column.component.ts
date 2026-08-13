import { CommonModule } from "@angular/common";
import { Component, Input, TemplateRef } from "@angular/core";

@Component({
    selector: 'app-table-col',
    imports: [CommonModule],
    template: `
    <td class="px-5 py-3">
        <ng-container *ngIf="cellTemplates && cellTemplates[cell.type]; else plainText">
            <ng-container *ngTemplateOutlet="cellTemplates[cell.type]; context: { cell: cell }"></ng-container>
        </ng-container>
        <ng-template #plainText>{{ cell.value }}</ng-template>
    </td>
  `,
})
export class TableColComponent {
    @Input() cell!: any;
    @Input() cellTemplates: { [key: string]: TemplateRef<any> } = {};
}
