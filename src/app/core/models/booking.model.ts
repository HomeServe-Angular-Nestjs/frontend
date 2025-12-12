import { SelectedServiceIdsType } from "../../modules/pages/customer/booking-1-pick-service/customer-pick-a-service.component";
import { BookingStatus, CancelStatus, PaymentSource, PaymentStatus } from "../enums/enums";
import { RazorpayOrder, RazorpayPaymentResponse } from "./payment.model";
import { ISlotSource } from "./schedules.model";
import { IAvailableSlot } from "./slot-rule.model";
import { ILocation } from "./user.model";

// --------------------
// Shared Interfaces
// --------------------

export interface IPagination {
  page: number;
  limit: number;
  total: number;
}

export interface IPriceBreakup {
  serviceId: string;
  subServiceIds: string[];
}

export interface IPriceBreakupData {
  subTotal: number;
  tax: number;
  fee: number;
  total: number;
  taxRate?: number;
  feeRate?: number;
}

export type CustomerLocationType = Omit<ILocation, 'type'> & { phone: string };

export interface IBookingDetailsBase {
  bookingId: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  expectedArrivalTime: string;
  cancelStatus: CancelStatus | null;
  cancelReason: string | null;
  cancelledAt: Date | null;
  totalAmount: number;
  orderedServices: {
    title: string;
    price: string;
    estimatedTime: string;
  }[];
  transaction: {
    id: string;
    paymentMethod: string;
    paymentDate: Date
  } | null;
}

export interface IReview {
  id: string;
  desc: string;
  rating: number;
  writtenAt: Date | string;
  // isActive: boolean;
  // isReported: boolean;
}

// --------------------
// Customer Related Interfaces
// --------------------

export interface IBookingData {
  providerId: string;
  total: number;
  location: Omit<ILocation, 'type'>;
  slotData: IAvailableSlot;
  serviceIds: SelectedServiceIdsType[];
  // transactionId: string | null;
  phoneNumber: string | null;
}

export interface IBooking {
  id: string;
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
  review: IReview | null;
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
  paymentSource: PaymentSource;
  cancelStatus: CancelStatus;
  totalAmount: number;
  createdAt: Date;
  transactionId: string | null;
  review: IReview | null;
}

export interface IBookingWithPagination {
  bookingData: IBookingResponse[];
  paginationData: IPagination;
}

export interface IBookingDetailCustomer extends IBookingDetailsBase {
  provider: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface IBookingFilter {
  search?: string;
  bookingStatus?: BookingStatus | '';
  paymentStatus?: PaymentStatus | '';
  date?: string;
  sort?: string;
}

export interface IBookingOverviewChanges {
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

export interface IUpdateBookingsPaymentStatus {
  transactionId: string;
  paymentStatus: PaymentStatus;
  bookingId: string;
}

// --------------------
// Provider Related Interfaces
// --------------------

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
  };
  bookingId: string;
  expectedArrivalTime: string;
  cancelStatus: CancelStatus;
  totalAmount: number;
  createdAt: Date;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
}

export interface IResponseProviderBookingLists {
  bookingData: IProviderBookingLists[];
  paginationData: IPagination;
}

export interface IBookingDetailProvider extends IBookingDetailsBase {
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
  };
}


//  Admin Related Interfaces
export interface IAdminBookingForTable {
  bookingId: string;
  customer: {
    avatar: string;
    id: string;
    username: string;
    email: string;
  };
  provider: {
    avatar: string;
    id: string;
    username: string;
    email: string;
  };
  date: Date;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
}

export interface IPaginatedBookingsResponse {
  bookingData: IAdminBookingForTable[];
  pagination: IPagination;
}

export interface IBookingStats {
  total: number;
  pending: number;
  cancelled: number;
  unpaid: number;
  refunded: number;
  completed: number;
}

export interface IAdminBookingFilter {
  page?: number;
  searchBy?: string;
  search?: string;
  bookingStatus?: BookingStatus | '';
  paymentStatus?: PaymentStatus | '';
}
