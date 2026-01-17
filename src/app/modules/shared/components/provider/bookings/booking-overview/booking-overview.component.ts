import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { BookingService } from "../../../../../../core/services/booking.service";

interface IBookingsOverviewTemplate {
    label: string;
    value: number;
    icon: string;
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
        this._bookingService.getBookingOverviewData().subscribe(data => {
            if (data) {
                this.overviewTemplateItems = this.overviewTemplateItems.map(items => {
                    let updatedValue = 0;
                    let updatedMeta = items.meta;

                    switch (items.label) {
                        case 'Total Bookings':
                            updatedValue = data.totalBookings;
                            if (data.changes)
                                updatedMeta = {
                                    ...items.meta,
                                    value: data.changes.totalBookingsChange
                                };
                            break;

                        case 'Pending Requests':
                            updatedValue = data.pendingRequests;
                            if (data.changes)
                                updatedMeta = {
                                    icon: data.changes.pendingRequestsChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down',
                                    value: Math.abs(data.changes.pendingRequestsChange),
                                    desc: 'vs last month',
                                };
                            break;

                        case 'Completed Jobs':
                            updatedValue = data.completedJobs;
                            if (data.changes)
                                updatedMeta = {
                                    icon: data.changes.completedJobsChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down',
                                    value: Math.abs(data.changes.completedJobsChange),
                                    desc: 'vs last month',
                                };
                            break;

                        case 'Pending Payments':
                            updatedValue = data.pendingPayments;
                            if (data.changes)
                                updatedMeta = {
                                    icon: data.changes.pendingPaymentsChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down',
                                    value: Math.abs(data.changes.pendingPaymentsChange),
                                    desc: 'vs last month',
                                };
                            break;

                        case 'Canceled Bookings':
                            updatedValue = data.cancelledBookings;
                            if (data.changes)
                                updatedMeta = {
                                    icon: data.changes.cancelledBookingsChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down',
                                    value: Math.abs(data.changes.cancelledBookingsChange),
                                    desc: 'vs last month',
                                };
                            break;
                    }
                    return {
                        ...items,
                        value: updatedValue,
                        meta: updatedMeta,
                    };
                });
            }
        });
    }

    getIconContainerClass(label: string): string {
        if (label.includes('Pending Requests')) return 'bg-blue-50 text-blue-600';
        if (label.includes('Completed')) return 'bg-green-50 text-green-600';
        if (label.includes('Canceled') || label.includes('Cancelled')) return 'bg-red-50 text-red-600';
        if (label.includes('Pending Payments')) return 'bg-amber-50 text-amber-600';
        return 'bg-green-50 text-green-600';
    }


}