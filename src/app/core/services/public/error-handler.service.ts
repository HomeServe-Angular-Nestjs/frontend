import { Injectable } from "@angular/core";
import { ErrorCodes } from "../../enums/enums";

@Injectable()
export class ErrorHandlerService {

    /** Predefined user-friendly messages keyed by backend error code. */
    private readonly _codeMessages: Partial<Record<ErrorCodes, string>> = {
        // ── Auth & Session ─────────────────────────────────────────────────
        [ErrorCodes.UNAUTHORIZED_ACCESS]: 'Your session has expired. Please log in again.',
        [ErrorCodes.INVALID_CREDENTIALS]: 'Incorrect email or password. Please try again.',
        [ErrorCodes.TOKEN_INVALID]: 'Your session is no longer valid. Please log in again.',
        [ErrorCodes.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
        [ErrorCodes.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
        [ErrorCodes.ACCOUNT_LOCKED]: 'Your account has been locked. Please contact support.',
        [ErrorCodes.FORBIDDEN]: 'You do not have permission to perform this action.',
        [ErrorCodes.OPERATION_NOT_ALLOWED]: 'This action is not allowed.',

        // ── Subscription ───────────────────────────────────────────────────
        [ErrorCodes.NO_ACTIVE_SUBSCRIPTION]: 'You need an active subscription to access this feature.',

        // ── Booking ────────────────────────────────────────────────────────
        [ErrorCodes.BOOKING_NOT_FOUND_ERROR]: 'Booking not found. It may have been removed.',
        [ErrorCodes.BOOKING_ALREADY_COMPLETED]: 'This booking has already been completed.',
        [ErrorCodes.BOOKING_ALREADY_CANCELLED]: 'This booking has already been cancelled.',
        [ErrorCodes.BOOKING_ALREADY_REFUNDED]: 'A refund for this booking has already been processed.',
        [ErrorCodes.BOOKING_RELEASE_FAILED]: 'Failed to release the booking. Please try again.',
        [ErrorCodes.ACTION_FORBIDDEN_UNPAID]: 'Payment must be completed before this action can be performed.',
        [ErrorCodes.NO_ACTIVE_BOOKINGS]: 'You have no active bookings at this time.',

        // ── Payment ────────────────────────────────────────────────────────
        [ErrorCodes.PAYMENT_IN_PROGRESS]: 'A payment is already in progress. Please wait a moment.',
        [ErrorCodes.PAYMENT_IN_PROGRESS_ERROR]: 'A payment operation is already running. Please wait.',
        [ErrorCodes.PAYMENT_DUPLICATE_ATTEMPT_ERROR]: 'This invoice has already been paid.',
        [ErrorCodes.PAYMENT_VERIFICATION_FAILED]: 'Payment verification failed. Please contact support.',
        [ErrorCodes.PAYMENT_METHOD_DECLINED]: 'Your payment method was declined. Please try a different one.',

        // ── Wallet ─────────────────────────────────────────────────────────
        [ErrorCodes.INSUFFICIENT_BALANCE_ERROR]: 'You do not have enough balance in your wallet.',
        [ErrorCodes.WALLET_UPDATE_ERROR]: 'Wallet update failed. Please try again.',
        [ErrorCodes.AMOUNT_CREDIT_ERROR]: 'Failed to credit your wallet. Please contact support.',
        [ErrorCodes.AMOUNT_DEBIT_ERROR]: 'Failed to debit your wallet. Please contact support.',

        // ── File Uploads ───────────────────────────────────────────────────
        [ErrorCodes.INVALID_FILE_TYPE]: 'Invalid file type. Only image files are allowed.',
        [ErrorCodes.FILE_TOO_LARGE]: 'The file is too large. Please upload a smaller file.',
        [ErrorCodes.UNSUPPORTED_FILE_TYPE]: 'This file type is not supported. Please use a supported format.',
        [ErrorCodes.NETWORK_FAILURE]: 'Upload service is temporarily unavailable. Please try again.',
        [ErrorCodes.UPLOAD_PROVIDER_ERROR]: 'Image upload was rejected by the storage provider. Please try again.',
        [ErrorCodes.EMPTY_RESULT]: 'Image upload failed — no result was returned. Please try again.',
        [ErrorCodes.UPLOAD_UNKNOWN_ERROR]: 'An error occurred while uploading. Please try again.',

        // ── Conflicts & Duplicates ─────────────────────────────────────────
        [ErrorCodes.MONGO_DUPLICATE_KEY]: 'This record already exists.',
        [ErrorCodes.EMAIL_ALREADY_REGISTERED]: 'This email address is already in use.',
        [ErrorCodes.RESOURCE_CONFLICT]: 'A conflict occurred with existing data. Please review and try again.',
        [ErrorCodes.CONFLICT]: 'A conflict occurred. Please review and try again.',
        [ErrorCodes.CART_ITEM_ALREADY_EXISTS]: 'This service is already in your cart',

        // ── Not Found ──────────────────────────────────────────────────────
        [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
        [ErrorCodes.RESOURCE_NOT_FOUND]: 'The requested resource was not found.',

        // ── Validation ─────────────────────────────────────────────────────
        [ErrorCodes.VALIDATION_FAILED]: 'Please check your input and try again.',
        [ErrorCodes.BAD_REQUEST]: 'Your request could not be processed. Please check your input.',
        [ErrorCodes.INVALID_AVAILABILITY_TIME]: 'The selected time slot is not available. Please choose another.',

        // ── System & Rate Limiting ─────────────────────────────────────────
        [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please slow down and try again.',
        [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
        [ErrorCodes.DATABASE_CONNECTION_FAILED]: 'Unable to reach the server. Please try again later.',
        [ErrorCodes.DATABASE_OPERATION_FAILED]: 'A server error occurred. Please try again.',
        [ErrorCodes.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred. Please try again later.',
    };

    /** Codes whose mapped text is a generic fallback — for these, prefer a user-friendly backend message. */
    private readonly _genericCodes = new Set<ErrorCodes>([
        ErrorCodes.BAD_REQUEST,
        ErrorCodes.CONFLICT,
        ErrorCodes.NOT_FOUND,
        ErrorCodes.RESOURCE_NOT_FOUND,
        ErrorCodes.VALIDATION_FAILED,
        ErrorCodes.RESOURCE_CONFLICT,
        ErrorCodes.MONGO_DUPLICATE_KEY,
        ErrorCodes.OPERATION_NOT_ALLOWED,
        ErrorCodes.FORBIDDEN,
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        ErrorCodes.SERVICE_UNAVAILABLE,
    ]);

   
    getErrorMessage(status: number, errorCode?: string, backendMessage?: string): string {
        if (status >= 500) {
            return 'An unexpected error occurred. Please try again later.';
        }

        const mapped = errorCode ? this._codeMessages[errorCode as ErrorCodes] : undefined;
        const isGenericMapping = !!errorCode && this._genericCodes.has(errorCode as ErrorCodes);

        if (backendMessage && this._isUserFriendly(backendMessage) && isGenericMapping) {
            return backendMessage;
        }

        if (mapped) {
            return mapped;
        }

        if (backendMessage && this._isUserFriendly(backendMessage)) {
            return backendMessage;
        }

        return this._defaultMessageForStatus(status);
    }


    private _isUserFriendly(message: string): boolean {
        const technicalPatterns = [
            /internal server error/i,
            /mongodb/i,
            /mongoose/i,
            /cast to objectid/i,
            /duplicate key/i,
            /e11000/i,
            /cannot read prop/i,
            /undefined is not/i,
            /null reference/i,
            /stack trace/i,
            /at \w+\.?\w+\s*\(/,           // stack frame pattern
            /not found with (id|ID):/i,     // leaks a raw object id
            /[0-9a-f]{24}/i,                // raw Mongo ObjectId
        ];
        return !technicalPatterns.some(p => p.test(message));
    }

    private _defaultMessageForStatus(status: number): string {
        switch (status) {
            case 400: return 'Please check your input and try again.';
            case 401: return 'Your session has expired. Please log in again.';
            case 403: return 'You do not have permission to perform this action.';
            case 404: return 'The requested resource was not found.';
            case 409: return 'A conflict occurred. Please review and try again.';
            case 422: return 'The provided data is invalid. Please check and try again.';
            case 429: return 'Too many requests. Please slow down and try again.';
            case 503: return 'Service is temporarily unavailable. Please try again later.';
            default: return 'An unexpected error occurred. Please try again later.';
        }
    }
}