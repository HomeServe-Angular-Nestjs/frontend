import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { SharedDataService } from '../../../../core/services/public/shared-data.service';
import { ProviderService } from '../../../../core/services/provider.service';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { IProviderDashboardOverview } from '../../../../core/models/dashboard.model';
import { selectProvider } from '../../../../store/provider/provider.selector';
import { DashboardHeaderComponent } from '../../../shared/components/provider/dashboard/dashboard-header/dashboard-header.component';
import { NextBookingCardComponent } from '../../../shared/components/provider/dashboard/next-booking-card/next-booking-card.component';
import { DashboardAvailabilityCardComponent } from '../../../shared/components/provider/dashboard/dashboard-availability-card/dashboard-availability-card.component';
import { RecentBookingsPreviewComponent } from '../../../shared/components/provider/dashboard/recent-bookings-preview/recent-bookings-preview.component';
import { DashboardPerformanceCardComponent } from '../../../shared/components/provider/dashboard/dashboard-performance-card/dashboard-performance-card.component';
import { DashboardAttentionCardComponent } from '../../../shared/components/provider/dashboard/dashboard-attention-card/dashboard-attention-card.component';
import { DashboardSkeletonComponent } from '../../../shared/components/provider/dashboard/dashboard-skeleton/dashboard-skeleton.component';
import { KpiCardComponent, KpiTone } from '../../../shared/components/analytics/kpi-card/kpi-card.component';
import { KpiCardGridComponent } from '../../../shared/components/analytics/kpi-card-grid/kpi-card-grid.component';

@Component({
  selector: 'app-provider-homepage',
  templateUrl: './provider-homepage.component.html',
  imports: [
    CommonModule,
    RouterLink,
    DashboardHeaderComponent,
    NextBookingCardComponent,
    DashboardAvailabilityCardComponent,
    RecentBookingsPreviewComponent,
    DashboardPerformanceCardComponent,
    DashboardAttentionCardComponent,
    DashboardSkeletonComponent,
    KpiCardComponent,
    KpiCardGridComponent,
  ],
})
export class ProviderHomepageComponent implements OnInit, OnDestroy {
  private readonly _sharedService = inject(SharedDataService);
  private readonly _providerService = inject(ProviderService);
  private readonly _subscriptionService = inject(SubscriptionService);
  private readonly _store = inject(Store);
  private _destroy$ = new Subject<void>();

  loading = true;
  error = false;
  data: IProviderDashboardOverview | null = null;

  providerName = 'Provider';
  verificationVerified = true;
  hasSubscription = true;

  ngOnInit(): void {
    this._sharedService.setProviderHeader('Dashboard');

    this._store.select(selectProvider)
      .pipe(takeUntil(this._destroy$))
      .subscribe((provider) => {
        this.providerName = provider?.fullname || provider?.username || 'Provider';
        this.verificationVerified = provider?.verificationStatus === 'verified';
      });

    this._subscriptionService.hasActiveSubscription()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => (this.hasSubscription = !!res?.success),
        error: () => (this.hasSubscription = false),
      });

    this._load();
  }

  private _load(): void {
    this.loading = true;
    this.error = false;

    this._providerService.getDashboardOverview()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res: any) => {
          this.data = res?.data ?? null;
          this.loading = false;
        },
        error: () => {
          this.data = null;
          this.loading = false;
          this.error = true;
        },
      });
  }

  retry(): void {
    this._load();
  }

  // ---- Derived values passed to children ----

  get nextBookingTime(): string {
    const slot = this.data?.nextBooking?.slot;
    if (slot?.from) return this._fmtTime(slot.from);
    const fallback = this.data?.nextAvailableSlot;
    return fallback?.from ? this._fmtTime(fallback.from) : '';
  }

  get isNewProvider(): boolean {
    const d = this.data;
    if (!d) return false;
    const totalBookings = d.bookings?.totalBookings ?? 0;
    return d.activeServiceCount === 0 && totalBookings === 0 && d.recentBookings.length === 0;
  }

  get welcomeSteps(): { icon: string; title: string; description: string; link: string[]; cta: string }[] {
    const steps = [];
    if (!this.verificationVerified) {
      steps.push({
        icon: 'fa-solid fa-id-card',
        title: 'Get verified',
        description: 'Complete your document verification to win customer trust.',
        link: ['/provider/profiles'],
        cta: 'Verify now',
      });
    }
    if (!this.hasSubscription) {
      steps.push({
        icon: 'fa-solid fa-crown',
        title: 'Pick a plan',
        description: 'Choose a subscription plan to start accepting bookings.',
        link: ['/provider/plans'],
        cta: 'View plans',
      });
    }
    steps.push(
      {
        icon: 'fa-solid fa-layer-group',
        title: 'Add your services',
        description: 'List what you offer so customers can find and book you.',
        link: ['/provider/manage-services'],
        cta: 'Add services',
      },
      {
        icon: 'fa-solid fa-calendar-days',
        title: 'Set your availability',
        description: 'Tell customers when you are free to take bookings.',
        link: ['/provider/availability'],
        cta: 'Set availability',
      },
    );
    return steps;
  }

  get kpis(): { label: string; value: string | number; unit?: string; icon: string; tone: KpiTone; description?: string }[] {
    const d = this.data;
    if (!d) return [];
    const revenue = d.revenue ?? {};
    const bookings = d.bookings ?? {};
    const walletBalance = d.wallet?.balance ?? null;
    return [
      {
        label: 'Total Earnings',
        value: (revenue.totalEarnings ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 }),
        unit: '₹',
        icon: 'fa-solid fa-indian-rupee-sign',
        tone: 'positive',
        description: walletBalance != null && !this.isNewProvider ? `Wallet balance ₹${walletBalance.toLocaleString('en-IN')}` : undefined,
      },
      {
        label: 'Pending',
        value: revenue.pendingCount ?? 0,
        icon: 'fa-solid fa-hourglass-half',
        tone: 'warning',
      },
      {
        label: 'Upcoming Bookings',
        value: bookings.upcomingBookings ?? 0,
        icon: 'fa-solid fa-calendar-check',
        tone: 'info',
      },
      {
        label: 'Avg Booking Value',
        value: (bookings.averageBookingValue ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 }),
        unit: '₹',
        icon: 'fa-solid fa-receipt',
        tone: 'neutral',
      },
    ];
  }

  private _fmtTime(value: string): string {
    if (!value) return '';
    const [h, m] = value.split(':');
    if (!h) return value;
    const date = new Date();
    date.setHours(Number(h), Number(m || 0), 0, 0);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
