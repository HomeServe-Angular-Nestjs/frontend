import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { BookingService } from "../../../../../../core/services/booking.service";

interface IBookingsOverviewTemplate {
    label: string;
    value: number;
    icon: string;
    sparkline?: string;
    meta: {
        icon: string;
        value: number;
        desc: string;
    }
};


@Component({
    selector: 'app-provider-booking-overview',
    templateUrl: './booking-overview.component.html',
    imports: [CommonModule]
})
export class ProviderBookingOverviewComponent implements OnInit {
    private readonly _bookingService = inject(BookingService);

    isLoading = true;

    overviewTemplateItems: IBookingsOverviewTemplate[] = [
        {
            label: 'Total Bookings',
            value: 0,
            icon: 'fas fa-calendar-check',
            meta: {
                icon: 'fas fa-arrow-up',
                value: 10,
                desc: 'vs last month',
            },
        },
        {
            label: 'Pending Requests',
            value: 0,
            icon: 'fas fa-hourglass-half',
            meta: {
                icon: 'fas fa-arrow-up',
                value: 0,
                desc: 'vs last month',
            }
        },
        {
            label: 'Completed Jobs',
            value: 0,
            icon: 'fas fa-check-circle',
            meta: {
                icon: 'fas fa-arrow-up',
                value: 0,
                desc: 'vs last month',
            },
        },
        {
            label: 'Pending Payments',
            value: 0,
            icon: 'fas fa-credit-card',
            meta: {
                icon: 'fas fa-arrow-up',
                value: 0,
                desc: 'vs last month',
            }
        },
        {
            label: 'Canceled Bookings',
            value: 0,
            icon: 'fas fa-ban',
            meta: {
                icon: 'fas fa-arrow-down',
                value: 10,
                desc: 'vs last month',
            },
        },
    ];


    ngOnInit(): void {
        this._bookingService.getBookingOverviewData().subscribe({
            next: (data) => {
                if (data) {
                    this.overviewTemplateItems = this.overviewTemplateItems.map(items => {
                        let updatedValue = 0;
                        let updatedMeta = items.meta;

                        switch (items.label) {
                            case 'Total Bookings':
                                updatedValue = data.totalBookings;
                                if (data.changes)
                                    updatedMeta = {
                                        icon: data.changes.totalBookingsChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down',
                                        value: data.changes.totalBookingsChange,
                                        desc: 'vs last month',
                                    };
                                break;

                            case 'Pending Requests':
                                updatedValue = data.pendingRequests;
                                if (data.changes)
                                    updatedMeta = {
                                        icon: data.changes.pendingRequestsChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down',
                                        value: data.changes.pendingRequestsChange,
                                        desc: 'vs last month',
                                    };
                                break;

                            case 'Completed Jobs':
                                updatedValue = data.completedJobs;
                                if (data.changes)
                                    updatedMeta = {
                                        icon: data.changes.completedJobsChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down',
                                        value: data.changes.completedJobsChange,
                                        desc: 'vs last month',
                                    };
                                break;

                            case 'Pending Payments':
                                updatedValue = data.pendingPayments;
                                if (data.changes)
                                    updatedMeta = {
                                        icon: data.changes.pendingPaymentsChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down',
                                        value: data.changes.pendingPaymentsChange,
                                        desc: 'vs last month',
                                    };
                                break;

                            case 'Canceled Bookings':
                                updatedValue = data.cancelledBookings;
                                if (data.changes)
                                    updatedMeta = {
                                        icon: data.changes.cancelledBookingsChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down',
                                        value: data.changes.cancelledBookingsChange,
                                        desc: 'vs last month',
                                    };
                                break;
                        }
                        const sparkline = data.changes ? this._buildSparkline(updatedMeta.value) : undefined;
                        return {
                            ...items,
                            value: updatedValue,
                            meta: updatedMeta,
                            sparkline,
                        };
                    });
            }
            this.isLoading = false;
        },
        error: () => {
            this.isLoading = false;
        }
    });
}

    private _buildSparkline(change: number): string {
        const points = 7;
        const width = 72;
        const height = 26;
        const direction = change >= 0 ? 1 : -1;
        const amplitude = Math.min(Math.max(Math.abs(change) / 100, 0.25), 0.9);
        const result: string[] = [];

        for (let i = 0; i <= points; i++) {
            const t = i / points;
            const trend = direction * amplitude * (height / 2) * t;
            const wobble = Math.sin(t * Math.PI * 3 + (i % 2)) * 1.3;
            const x = (width / points) * i;
            const y = height / 2 - trend + wobble;
            result.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        }

        return result.join(' ');
    }

    getIconContainerClass(label: string): string {
        if (label.includes('Pending Requests')) return 'bg-blue-500/10 text-blue-600 ring-blue-500/20';
        if (label.includes('Completed')) return 'bg-green-500/10 text-green-600 ring-green-500/20';
        if (label.includes('Canceled') || label.includes('Cancelled')) return 'bg-red-500/10 text-red-600 ring-red-500/20';
        if (label.includes('Pending Payments')) return 'bg-amber-500/10 text-amber-600 ring-amber-500/20';
        return 'bg-green-500/10 text-green-600 ring-green-500/20';
    }


}