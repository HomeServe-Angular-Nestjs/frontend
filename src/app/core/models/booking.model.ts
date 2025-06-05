import { SelectedServiceIdsType } from "../../modules/pages/customer/booking-1-pick-service/customer-pick-a-service.component";
import { BookingStatus, PaymentStatus } from "../enums/enums";
import { ISlotSource } from "./schedules.model";
import { Address } from "./user.model";

export interface IPriceBreakup {
    serviceId: string;
    subServiceIds: string[]
}

export interface IPriceBreakupData {
    subTotal: number;
    tax: number;
    visitingFee: number;
    total: number;
}

export type CustomerLocationType = Omit<Address, 'type'>;

export interface IBookingData {
    providerId: string;
    total: number;
    location: CustomerLocationType;
    slotData: ISlotSource;
    serviceIds: SelectedServiceIdsType[];
}
export interface IBooking {
    customerId: string;
    providerId: string;
    totalAmount: number;
    expectedArrivalTime: Date;
    actualArrivalTime: Date | null;
    bookingStatus: BookingStatus;
    cancelledAt: Date | null;
    cancellationReason: string | null;
    location: {
        address: string;
        coordinates: [number, number];
    };
    scheduleId: string;
    slotId: string;
    services: {
        serviceId: string;
        subserviceIds: string[];
    }[];
    paymentStatus: PaymentStatus;
    transactionId: string | null;
}

export interface IBookingResponse {
    bookingId: string;
    provider: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };
    services: {
        id: string;
        name: string;
    }[];
    expectedArrivalTime: Date | string;
    bookingStatus: BookingStatus;
    paymentStatus: PaymentStatus;
    totalAmount: number;
    createdAt: Date;
}

export interface IBookingWithPagination {
    bookingData: IBookingResponse[];
    paginationData: IPagination;
}


export interface IProviderBookingLists {
    services: {
        id: string;
        title: string;
        image: string;
    }[];
    customer: {
        id: string;
        name: string;
        avatar: string;
        email: string;
    },
    bookingId: string;
    expectedArrivalTime: string;
    totalAmount: number;
    createdAt: Date;
    paymentStatus: PaymentStatus;
    bookingStatus: BookingStatus;
}

export interface IPagination {
    page: number;
    limit: number;
    total: number;
}

export interface IBookingDetails {
    bookingId: string;
    bookingStatus: BookingStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
    expectedArrivalTime: string;
    totalAmount: number;

    provider: {
        name: string;
        email: string;
        phone: string;
    };

    orderedServices: {
        title: string;
        price: string;
        estimatedTime: string;
    }[];
}

export interface IResponseProviderBookingLists {
    bookingData: IProviderBookingLists[],
    paginationData: IPagination;
}


export interface IBookingFilter {
    search?: string;
    bookingStatus?: BookingStatus | '';
    paymentStatus?: PaymentStatus | '';
    date?: string;
    sort?: string;
}

interface IBookingOverviewChanges {
    totalBookingsChange: number;
    pendingRequestsChange: number;
    completedJobsChange: number;
    pendingPaymentsChange: number;
    cancelledBookingsChange: number;
}

export interface IBookingOverviewData {
    pendingRequests: number;
    completedJobs: number;
    pendingPayments: number;
    cancelledBookings: number;
    totalBookings: number;
    changes?: IBookingOverviewChanges;
}