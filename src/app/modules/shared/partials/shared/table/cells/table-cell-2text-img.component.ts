import { Component, Input } from "@angular/core";

@Component({
    selector: 'app-table-cell-image-two-text',
    template: `
    <div class="flex items-center gap-2">
      <img [src]="image" alt="avatar" class="w-8 h-8 rounded-full" />
      <div>
        <div class="text-sm font-medium">{{ title }}</div>
        <div class="text-xs text-gray-500">{{ subtitle }}</div>
      </div>
    </div>
  `,
    standalone: true,
})
export class ImageTwoTextCellComponent {
    @Input({ required: true }) image!: string;
    @Input({ required: true }) title!: string;
    @Input({ required: true }) subtitle!: string;

    ngOnInit() {
        console.log(this.image)
        console.log(this.title)
        console.log(this.subtitle)
    }
}
