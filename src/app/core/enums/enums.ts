export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
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
    CREATED = 'created',
    ATTEMPTED = 'attempted',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}

export enum ServiceSort {
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