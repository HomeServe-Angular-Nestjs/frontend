import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  template: `
        <button [type]="type" (click)="handleClicked()" [ngClass]="buttonClass" [disabled]="disabled">
            <ng-container *ngIf="textPosition === 'right'; else elseBlock">
              <p [ngClass]="textClass"><i *ngIf="icon" [ngClass]="'fas fa-' + icon"></i> <span *ngIf="text" [ngClass]="{'ml-2':icon}">{{text}}</span></p>
            </ng-container>
            <ng-template #elseBlock>
              <p [ngClass]="textClass"><span *ngIf="text" [ngClass]="{'mr-2': icon}">{{text}}</span> <i *ngIf="icon" [ngClass]="'fas fa-' + icon"></i></p>
            </ng-template>
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
  disabled: boolean = false;

  @Input()
  textPosition: 'left' | 'right' = 'right'

  @Input()
  buttonClass = 'px-4 py-2 bg-[#16A34A] text-white text-sm';

  @Input()
  textClass = '';

  @Output()
  clicked = new EventEmitter<void>();

  handleClicked() {
    this.clicked.emit();
  }
}