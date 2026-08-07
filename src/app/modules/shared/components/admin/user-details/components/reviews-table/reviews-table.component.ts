import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IReviewOverview } from '../../../../../../../core/models/user-details.model';

@Component({
    selector: 'app-user-reviews-table',
    standalone: true,
    host: { class: 'block' },
    imports: [CommonModule],
    templateUrl: './reviews-table.component.html'
})
export class UserReviewsTableComponent {
    @Input() reviews: IReviewOverview[] = [];

    starsArray(rating: number): number[] {
        return Array(Math.round(rating)).fill(0);
    }

    emptyStarsArray(rating: number): number[] {
        return Array(5 - Math.round(rating)).fill(0);
    }
}
