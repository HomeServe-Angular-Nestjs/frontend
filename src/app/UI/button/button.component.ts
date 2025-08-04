import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: 'app-button',
    imports: [CommonModule],
    template: `
        <button [type]="type" (click)="handleClicked()" [ngClass]="buttonClass">
            <i *ngIf="icon" [ngClass]="'fas fa-' + icon"></i> <span *ngIf="text" [ngClass]="{'ml-2':icon}">{{text}}</span>
        </button>
    `,
})
export class ButtonComponent {
    @Input()
    text: string = '';

    @Input()
    type: string = 'button';

    @Input()
    icon = '';

    @Input()
    buttonClass = 'px-4 py-2 bg-[#16A34A] text-white text-sm';

    @Output()
    clicked = new EventEmitter<void>();

    handleClicked() {
        this.clicked.emit();
    }
}