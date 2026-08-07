import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { getCategoryIdentity } from '../../../../../../core/utils/landing.identity';

@Component({
    selector: 'app-landing-footer',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './landing-footer.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFooterComponent {
    readonly year = new Date().getFullYear();
    readonly services = [
        'Professional Cleaning',
        'Plumbing Solutions',
        'Electrical Services',
        'Painting & Decor',
        'Repairs & Maintenance',
        'Pest Control',
    ];

    readonly companyLinks = [
        { label: 'About Us', target: null },
        { label: 'How It Works', target: 'how-it-works' },
        { label: 'Featured Providers', target: 'providers' },
        { label: 'Become a Provider', target: null },
    ];

    readonly supportLinks = [
        { label: 'Help Center', target: 'faq' },
        { label: 'Contact Us', target: 'faq' },
        { label: 'Booking Support', target: 'faq' },
        { label: 'Safety', target: 'safety' },
    ];

    readonly legalLinks = [
        { label: 'Terms of Service', target: null },
        { label: 'Privacy Policy', target: null },
        { label: 'Cancellation Policy', target: null },
    ];

    scrollTo(target: string | null): void {
        if (!target) return;
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
}