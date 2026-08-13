import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface AttentionItem {
    id: string;
    tone: 'amber' | 'red' | 'slate';
    icon: string;
    title: string;
    link: string[];
    linkLabel: string;
}

@Component({
    selector: 'app-dashboard-attention-card',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard-attention-card.component.html',
})
export class DashboardAttentionCardComponent {
    @Input() pendingCount = 0;
    @Input() cancelledCount = 0;
    @Input() upcomingCount = 0;
    @Input() activeServiceCount = 0;
    @Input() verificationVerified = true;
    @Input() hasSubscription = true;

    get items(): AttentionItem[] {
        const list: AttentionItem[] = [];

        if (!this.verificationVerified) {
            list.push({
                id: 'verify',
                tone: 'amber',
                icon: 'fa-solid fa-id-card',
                title: 'Complete your document verification',
                link: ['/provider/profiles'],
                linkLabel: 'Verify',
            });
        }

        if (!this.hasSubscription) {
            list.push({
                id: 'subscribe',
                tone: 'amber',
                icon: 'fa-solid fa-crown',
                title: 'Choose a subscription plan',
                link: ['/provider/plans'],
                linkLabel: 'Subscribe',
            });
        }

        if (this.pendingCount > 0) {
            list.push({
                id: 'pending',
                tone: 'amber',
                icon: 'fa-solid fa-hourglass-half',
                title: `${this.pendingCount} booking request${this.pendingCount > 1 ? 's are' : ' is'} pending`,
                link: ['/provider/bookings'],
                linkLabel: 'Review',
            });
        }

        if (this.cancelledCount > 0) {
            list.push({
                id: 'cancelled',
                tone: 'red',
                icon: 'fa-solid fa-xmark-circle',
                title: `${this.cancelledCount} booking${this.cancelledCount > 1 ? 's' : ''} were cancelled`,
                link: ['/provider/bookings'],
                linkLabel: 'View',
            });
        }

        if (this.upcomingCount === 0) {
            list.push({
                id: 'upcoming',
                tone: 'slate',
                icon: 'fa-solid fa-calendar-day',
                title: 'No upcoming bookings',
                link: ['/provider/availability'],
                linkLabel: 'Manage',
            });
        }

        if (this.activeServiceCount === 0) {
            list.push({
                id: 'services',
                tone: 'slate',
                icon: 'fa-solid fa-briefcase',
                title: 'No active services',
                link: ['/provider/manage-services'],
                linkLabel: 'Add services',
            });
        }

        return list;
    }

    get toneClass(): Record<string, string> {
        return {
            amber: 'bg-amber-50 text-amber-700',
            red: 'bg-red-50 text-red-700',
            slate: 'bg-slate-50 text-slate-600',
        };
    }
}