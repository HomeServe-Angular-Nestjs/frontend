export enum ErrorCodes {
    MONGO_DUPLICATE_KEY = 'MONGO_DUPLICATE_KEY',
    PAYMENT_IN_PROGRESS = 'PAYMENT_IN_PROGRESS',
    USER_NOT_AUTHORIZED = 'USER_NOT_AUTHORIZED',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
    VALIDATION_FAILED = 'VALIDATION_FAILED',
    SESSION_EXPIRED = 'SESSION_EXPIRED',
    ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
    EMAIL_ALREADY_REGISTERED = 'EMAIL_ALREADY_REGISTERED',
    PASSWORD_TOO_WEAK = 'PASSWORD_TOO_WEAK',
    INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
    PAYMENT_METHOD_DECLINED = 'PAYMENT_METHOD_DECLINED',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
    DATABASE_CONNECTION_FAILED = 'DATABASE_CONNECTION_FAILED',
    TOKEN_INVALID = 'TOKEN_INVALID',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
    FILE_TOO_LARGE = 'FILE_TOO_LARGE',
    NO_ACTIVE_SUBSCRIPTION = 'NO_ACTIVE_SUBSCRIPTION',

    UNSUPPORTED_FILE_TYPE = 'UNSUPPORTED_FILE_TYPE',
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
    BOOKING = 'booking',
    SUBSCRIPTION = 'subscription',
    CUSTOMER_COMMISSION = 'customer_commission',
    PROVIDER_COMMISSION = 'provider_commission',
    REFUND = 'refund',
    BOOKING_RELEASE = 'booking_release',
}

export enum SortEnum {
    LATEST = 'latest',
    OLDEST = 'oldest',
    A_Z = 'a-z',
    Z_A = 'z-a'
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
    MON = 'Mon',
    TUE = 'Tue',
    WED = 'Wed',
    THU = 'Thu',
    FRI = 'Fri',
    SAT = 'Sat',
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