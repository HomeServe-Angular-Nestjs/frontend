import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
    selector: 'app-loading-circle-animation',
    templateUrl: './loading-circle.component.html',
    imports: [CommonModule]
})
export class LoadingCircleAnimationComponent {
    @Input() text: string = 'Loading please wait...';
    @Input() color: string = 'blue';
}