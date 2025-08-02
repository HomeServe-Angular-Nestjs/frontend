import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: 'app-button',
    imports: [CommonModule],
    template: `
        <button [type]="type" (click)="handleClicked()" class="px-4 py-2 bg-[#16A34A] text-white rounded-lg text-sm hover:bg-green-600">
            <i [ngClass]="'fas ' + icon"></i> <span [ngClass]="{'ml-2':icon}">{{text}}</span>
        </button>
    `,
})
export class ButtonComponent {
    @Input({ required: true })
    text!: string;

    @Input()
    type: string = 'button';

    @Input()
    icon = '';

    @Output()
    clicked = new EventEmitter<void>();

    handleClicked() {
        this.clicked.emit();
    }
}