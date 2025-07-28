import { Component, Input } from "@angular/core";

@Component({
    selector: 'app-table-cell-text',
    template: `<span class="text-sm text-gray-700">{{ text }}</span>`,
    standalone: true,
})
export class TextCellComponent {
    @Input({ required: true }) text: string = '';
}
