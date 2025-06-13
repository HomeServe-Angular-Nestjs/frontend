// floating-input.component.ts
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-floating-input',
    templateUrl: './provider-floating-input.component.html',
    imports: [FormsModule]
})
export class FloatingInputComponent {
    @Input() label!: string;
    @Input() type: string = 'text';
    @Input() model: any;
}
