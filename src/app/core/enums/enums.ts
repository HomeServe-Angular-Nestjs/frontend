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