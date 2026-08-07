import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectCheckStatus } from '../../../../../../store/auth/auth.selector';
import { ILandingFeaturedProvider } from '../../../../../../core/models/landing.model';
import { getColorFromChar } from '../../../../../../core/utils/style.utils';
import { ScrollRevealDirective } from '../../../../../../core/directives/scroll-reveal.directive';

@Component({
    selector: 'app-landing-featured-providers',
    standalone: true,
    imports: [CommonModule, ScrollRevealDirective],
    templateUrl: './landing-featured-providers.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFeaturedProvidersComponent {
    private readonly _router = inject(Router);
    private readonly _store = inject(Store);
    private readonly _status = toSignal(this._store.select(selectCheckStatus), { initialValue: 'pending' });

    @Input() providers: ILandingFeaturedProvider[] = [];

    get isAuthenticated(): boolean {
        return this._status() === 'authenticated';
    }

    avatarColor(name: string): string {
        return getColorFromChar((name || '?').charAt(0));
    }

    openProvider(provider: ILandingFeaturedProvider): void {
        if (this.isAuthenticated) {
            this._router.navigate(['provider_details', provider.id, 'about']);
        } else {
            this._router.navigate(['/login'], {
                queryParams: { role: 'customer', return: `/provider_details/${provider.id}/about` },
            });
        }
    }

    bookProvider(provider: ILandingFeaturedProvider): void {
        if (this.isAuthenticated) {
            this._router.navigate(['provider_details', provider.id, 'about']);
        } else {
            this._router.navigate(['/login'], {
                queryParams: { role: 'customer', return: `/provider_details/${provider.id}/about` },
            });
        }
    }

    starType(index: number, rating: number = 0): string {
        if (index < Math.floor(rating)) return 'fas fa-star';
        if (index < rating) return 'fas fa-star-half-alt';
        return 'far fa-star text-slate-200';
    }
}