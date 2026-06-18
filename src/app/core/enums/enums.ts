export enum ErrorCodes {
  MONGO_DUPLICATE_KEY = 'MONGO_DUPLICATE_KEY',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  PAYMENT_IN_PROGRESS = 'PAYMENT_IN_PROGRESS',
  PAYMENT_VERIFICATION_FAILED = 'PAYMENT_VERIFICATION_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  DATABASE_OPERATION_FAILED = 'DATABASE_OPERATION_FAILED',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT',
  NOT_FOUND = 'NOT_FOUND',
  NO_ACTIVE_SUBSCRIPTION = 'NO_ACTIVE_SUBSCRIPTION',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  INVALID_AVAILABILITY_TIME = 'INVALID_AVAILABILITY_TIME',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  EMAIL_ALREADY_REGISTERED = 'EMAIL_ALREADY_REGISTERED',
  PAYMENT_METHOD_DECLINED = 'PAYMENT_METHOD_DECLINED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_CONNECTION_FAILED = 'DATABASE_CONNECTION_FAILED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE = 'UNSUPPORTED_FILE_TYPE',
  FORBIDDEN = 'FORBIDDEN',
  NO_ACTIVE_BOOKINGS = 'NO_ACTIVE_BOOKINGS',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  NETWORK_FAILURE = 'NETWORK_FAILURE',
  UPLOAD_PROVIDER_ERROR = 'UPLOAD_PROVIDER_ERROR',
  EMPTY_RESULT = 'EMPTY_RESULT',
  UPLOAD_UNKNOWN_ERROR = 'UPLOAD_UNKNOWN_ERROR',
  WALLET_UPDATE_ERROR = 'WALLET_UPDATE_ERROR',
  AMOUNT_CREDIT_ERROR = 'AMOUNT_CREDIT_ERROR',
  AMOUNT_DEBIT_ERROR = 'AMOUNT_DEBIT_ERROR',
  INSUFFICIENT_BALANCE_ERROR = 'INSUFFICIENT_BALANCE_ERROR',
  PAYMENT_DUPLICATE_ATTEMPT_ERROR = 'PAYMENT_DUPLICATE_ATTEMPT_ERROR',
  PAYMENT_IN_PROGRESS_ERROR = 'PAYMENT_IN_PROGRESS_ERROR',
  BOOKING_NOT_FOUND_ERROR = 'BOOKING_NOT_FOUND_ERROR',
  ACTION_FORBIDDEN_UNPAID = 'ACTION_FORBIDDEN_UNPAID',
  BOOKING_ALREADY_COMPLETED = 'BOOKING_ALREADY_COMPLETED',
  BOOKING_ALREADY_CANCELLED = 'BOOKING_ALREADY_CANCELLED',
  BOOKING_RELEASE_FAILED = 'BOOKING_RELEASE_FAILED',
  BOOKING_ALREADY_REFUNDED = 'BOOKING_ALREADY_REFUNDED',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum CancelStatus {
  IN_PROGRESS = 'in_progress',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export enum DateRange {
  TODAY = 'today',
  THIS_WEEK = 'thisWeek',
  THIS_MONTH = 'thisMonth',
  THIS_YEAR = 'thisYear'
}

export enum SortBy {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  NAME_ASCENDING = 'nameAsc',
  NAME_DESCENDING = 'nameDesc'
}

export enum TransactionStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PaymentDirection {
  DEBIT = 'debit',
  CREDIT = 'credit',

}

export enum PaymentSource {
  RAZORPAY = 'razorpay',
  INTERNAL = 'internal', // for wallet/commission transfers
}

export enum TransactionType {
  BOOKING_PAYMENT = 'booking_payment',
  BOOKING_RELEASE = 'booking_release',
  BOOKING_REFUND = 'booking_refund',
  CANCELLATION_FEE = 'cancellation_fee',
  CUSTOMER_COMMISSION = 'customer_commission',
  PROVIDER_COMMISSION = 'provider_commission',
  GST = 'gst',
  SUBSCRIPTION_PAYMENT = 'subscription_payment',
}

export enum SortEnum {
  LATEST = 'latest',
  OLDEST = 'oldest',
  A_Z = 'a-z',
  Z_A = 'z-a',
  PRICE_HIGH_TO_LOW = 'price_high_to_low',
  PRICE_LOW_TO_HIGH = 'price_low_to_high'
}

export enum Language {
  NATIVE = 'native',
  FLUENT = 'fluent',
  CONVERSATIONAL = 'conversational',
  BASIC = 'basic'
}

export enum UploadType {
  GALLERY = 'gallery',

}

export enum PlanDuration {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  LIFETIME = 'lifetime'
}

export enum WeekEnum {
  MON = 'mon',
  TUE = 'tue',
  WED = 'wed',
  THU = 'thu',
  FRI = 'fri',
  SAT = 'sat',
  SUN = 'Sun',
}

export enum RuleSortEnum {
  LATEST = 'latest',
  OLDEST = 'oldest',
  HIGH_PRIORITY = 'high_priority',
  LOW_PRIORITY = 'low_priority',
}

export enum NotificationType {
  SYSTEM = 'system',
  EVENT = 'event',
  REMINDER = 'reminder',
  CUSTOM = 'custom'
}

export enum NotificationTemplateId {
  INCOMPLETE_PROFILE = 'INCOMPLETE_PROFILE',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  ORDER_SUCCESS = 'ORDER_SUCCESS',
  BOOKING_STATUS_UPDATED = 'BOOKING_STATUS_UPDATED',
  BOOKING_COMPLETED = 'BOOKING_COMPLETED',
  SUBSCRIPTION_SUCCESS = 'SUBSCRIPTION_SUCCESS',
  BOOKING_RESCHEDULED = 'BOOKING_RESCHEDULED',
}

export enum ReportStatus {
  PENDING = 'pending',
  REJECTED = 'rejected',
  RESOLVED = 'resolved',
  IN_PROGRESS = 'in_progress'
}

export enum ComplaintReason {
  SPAM = 'spam',
  INAPPROPRIATE = 'inappropriate',
  HARASSMENT = 'harassment',
  OTHER = 'other'
}

export enum DiscountTypeEnum {
  Percentage = 'percentage',
  Flat = 'flat',
}

export enum UsageTypeEnum {
  OneTime = 'one-time',
  Expiry = 'expiry',
}
