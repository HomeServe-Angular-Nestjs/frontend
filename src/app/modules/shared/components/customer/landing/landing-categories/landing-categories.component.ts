import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectCheckStatus } from '../../../../../../store/auth/auth.selector';
import { ILandingCategory } from '../../../../../../core/models/landing.model';
import { getCategoryIdentity } from '../../../../../../core/utils/landing.identity';
import { ScrollRevealDirective } from '../../../../../../core/directives/scroll-reveal.directive';

@Component({
    selector: 'app-landing-categories',
    standalone: true,
    imports: [CommonModule, ScrollRevealDirective],
    templateUrl: './landing-categories.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingCategoriesComponent {
    private readonly _router = inject(Router);
    private readonly _store = inject(Store);
    private readonly _status = toSignal(this._store.select(selectCheckStatus), { initialValue: 'pending' });

    @Input() categories: ILandingCategory[] = [];

    get isAuthenticated(): boolean {
        return this._status() === 'authenticated';
    }

    identity(cat: ILandingCategory) {
        return getCategoryIdentity(cat.name, cat.categoryId);
    }

    openCategory(cat: ILandingCategory): void {
        if (this.isAuthenticated) {
            this._router.navigate(['/view_providers'], { queryParams: { categoryId: cat.categoryId } });
        } else {
            this._router.navigate(['/login'], {
                queryParams: { role: 'customer', return: `/view_providers?categoryId=${cat.categoryId}` },
            });
        }
    }
}