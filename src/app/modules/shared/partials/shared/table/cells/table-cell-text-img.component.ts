import { Component, Input } from "@angular/core";

@Component({
    selector: 'app-table-cell-avatar-text',
    template: `
    <div class="flex items-center gap-2">
      <img [src]="image" alt="avatar" class="w-8 h-8 rounded-full" />
      <span class="text-sm text-gray-800">{{ text }}</span>
    </div>
  `,
    standalone: true,
})
export class AvatarTextCellComponent {
    @Input({ required: true }) image!: string;
    @Input({ required: true }) text!: string;
}
