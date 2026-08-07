import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectCheckStatus, selectAuthUserType } from '../../../../../../store/auth/auth.selector';
import { navigationAfterLogin } from '../../../../../../core/utils/navigation.utils';
import { LANDING_SECTIONS } from '../../../../../../core/utils/landing.identity';

@Component({
    selector: 'app-landing-nav',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './landing-nav.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingNavComponent {
    private readonly _store = inject(Store);
    private readonly _router = inject(Router);

    readonly sections = LANDING_SECTIONS;

    scrolled = signal(false);
    mobileOpen = signal(false);

    private readonly _status = toSignal(this._store.select(selectCheckStatus), { initialValue: 'pending' });
    private readonly _type = toSignal(this._store.select(selectAuthUserType), { initialValue: null });

    isAuthenticated = computed(() => this._status() === 'authenticated');
    homeRoute = computed(() => {
        const type = this._type();
        return type ? navigationAfterLogin(type as any) : '/landing_page';
    });

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', this._onScroll, { passive: true });
        }
    }

    scrollToSection(event: Event, sectionId: string): void {
        event.preventDefault();
        this.mobileOpen.set(false);
        const el = document.getElementById(sectionId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    goHome(): void {
        this.mobileOpen.set(false);
        if (this.isAuthenticated()) {
            this._router.navigate([this.homeRoute()]);
        } else {
            this._router.navigate(['/landing_page']);
        }
    }

    private readonly _onScroll = (): void => {
        const past = window.scrollY > 24;
        if (past !== this.scrolled()) {
            this.scrolled.set(past);
        }
    };
}