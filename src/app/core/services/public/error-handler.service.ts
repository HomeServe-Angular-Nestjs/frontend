import { Injectable } from "@angular/core";
import { ErrorCodes } from "../../enums/enums";

@Injectable()
export class ErrorHandlerService {
    getErrorMessage(status: number, errorCode?: ErrorCodes, backendMessage?: string): string {
        switch (status) {
            case 400:
                return backendMessage || 'Bad request. Please check your input.';
                
            case 401:
                return backendMessage || 'Unauthorized access. Please log in again.';

            case 403:
                return backendMessage || 'Forbidden. You do not have permission.';

            case 404:
                return backendMessage || 'Resource not found.';

            case 409:
                switch (errorCode) {
                    case ErrorCodes.PAYMENT_IN_PROGRESS:
                        return 'A payment is already in progress. Please wait.';
                    case ErrorCodes.MONGO_DUPLICATE_KEY:
                        return 'This record already exists.';
                    default:
                        return backendMessage || 'Conflict error occurred.';
                }

            case 500:
                return backendMessage || 'Server error. Please try again later.';

            default:
                return backendMessage || 'An unexpected error occurred.';
        }
    }
}