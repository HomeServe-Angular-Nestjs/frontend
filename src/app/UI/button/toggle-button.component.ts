import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'app-toggle-button',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <label [class]="labelClass+ ' ' + 'flex items-center cursor-pointer select-none'">
        <span [class]="labelTextClass">{{ label }}</span>
        
        <input
        type="checkbox"
        class="sr-only"
        [checked]="checkedValue"
        (change)="onToggle()"
        >

        <div
        [class]="'relative inline-block rounded-full transition duration-200 ease-in-out ' + trackWidth + ' ' + trackHeight"
        [ngClass]="checkedValue ? activeColor : inactiveColor">
            <span
            [class]="'absolute left-0 top-0.5 bg-white rounded-full shadow transform transition duration-200 ease-in-out ' + knobWidth + ' ' + knobHeight"
            [ngClass]="checkedValue ? knobTranslateX : 'translate-x-1'"
            ></span>
        </div>
    </label> 
    `,
})
export class ToggleButtonComponent {
    @Input() label = '';
    @Input() labelClass = '';
    @Input() labelTextClass = '';

    @Input() checkedValue: boolean = false;
    @Output() checkedValueChange = new EventEmitter<void>();

    @Input() toggleClass = 'relative inline-block w-11 h-6 transition duration-200 ease-in-out rounded-full';
    @Input() activeColor = 'bg-green-500';
    @Input() inactiveColor = 'bg-gray-300';

    @Input() trackWidth = 'w-11';
    @Input() trackHeight = 'h-6';
    @Input() knobWidth = 'w-5';
    @Input() knobHeight = 'h-5';
    @Input() knobTranslateX = 'translate-x-5';

    onToggle() {
        this.checkedValueChange.emit();
    }
}
