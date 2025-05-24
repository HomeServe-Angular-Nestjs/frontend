import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SpacemanAnimationComponent } from '../../shared/partials/shared/loading-Animations/spaceman/spaceman.component';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [CommonModule, RouterModule, SpacemanAnimationComponent],
    templateUrl: './404.component.html',
    styleUrls: ['./404.component.scss']
})
export class NotFoundComponent implements OnInit {
    type: 'route' | 'data' = 'route';

    constructor(private route: ActivatedRoute) { }

    ngOnInit(): void {
        console.log('404 Page Rendered');
        this.route.data.subscribe(data => {
            this.type = data['type'] || 'route';
        });
    }
}