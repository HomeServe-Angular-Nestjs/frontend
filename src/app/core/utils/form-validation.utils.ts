import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { REGEXP_ENV } from "../../../environments/env";


export const FORM_VALIDATION_ERROR_MESSAGES: { [key: string]: string } = {
    required: '$FIELD is required.',
    minlength: '$FIELD must be at least $REQUIRED_LENGTH characters.',
    maxlength: '$FIELD must be no more than $REQUIRED_LENGTH characters.',
    email: 'Please enter a valid email address.',
    pattern: '$FIELD format is invalid.',
    min: '$FIELD must be at least $MIN.',
    max: '$FIELD must be at most $MAX.',
    invalidTime: `$FIELD is invalid.`,
    pastDate: '$FIELD is invalid. Past dates are not allowed',
    invalidDates: '$FIELD has invalid dates.',
    negativeNumber: 'Negative number in $FIELD is not allowed.',
    invalidTimeRange: 'Invalid time range.',
    sameTimeRange: 'Start Time and End Time Can\'t be the same.',
    invalidDateRange: 'Invalid date range.'
};

export const toTitleCase = (field: string): string => {
    return field
        // camelCase to words
        .replace(/([A-Z])/g, ' $1')
        // snake_case to words
        .replace(/_/g, ' ')
        // capitalize
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const getValidationMessage = (control: AbstractControl | null, fieldName: string) => {
    if (!control) return `Missing form control: ${fieldName}`;
    if (!control.errors) return null;

    for (const errorKey in control.errors) {
        const template = FORM_VALIDATION_ERROR_MESSAGES[errorKey];
        const errorDetails = control.errors[errorKey];

        if (template) {
            return template
                .replace(/\$FIELD/g, toTitleCase(fieldName))
                .replace(/\$REQUIRED_LENGTH/g, errorDetails?.requiredLength ?? '')
                .replace(/\$MIN/g, errorDetails?.min ?? '')
                .replace(/\$MAX/g, errorDetails?.max ?? '');
        } else {
            return `${toTitleCase(fieldName)} has an error (${errorKey})`;
        }
    }
    return null;
}

function clearSpecificError(control: AbstractControl | null, errorKey: string): void {
    if (!control || !control.errors || !control.errors[errorKey]) return;

    const { [errorKey]: _, ...remainingErrors } = control.errors;
    control.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
}

export function arrayNotEmptyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        return Array.isArray(value) && value.length > 0 ? null : { required: true }
    };
}

export function timeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (!value) return null;
        const timeRegex = REGEXP_ENV.time24Hour;
        return timeRegex.test(value) ? null : { invalidTime: true };
    };
}

export function pastDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const inputDate = new Date(control.value);
        const today = new Date();

        inputDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return inputDate < today ? { pastDate: true } : null
    };
}

export function checkNegativeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const raw = control.value;
        if (raw === null || raw === undefined || raw === '') return null;

        const value = Number(raw);
        return isNaN(value) || value <= 0 ? { negativeNumber: true } : null;
    };
}

export function commaSeparatedDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value: string = control.value;
        if (!value || !value.trim()) return null;

        const dateStrings: string[] = value.split(',').map(d => d.trim());

        const isValidDate = (dateStr: string): boolean => {
            const formatRegex = REGEXP_ENV.dateYYYYMMDD;
            if (!formatRegex.test(dateStr)) return false;

            const date = new Date(dateStr);
            const [year, month, day] = dateStr.split('-').map(Number);

            return (
                date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day
            );
        };

        const invalidDates = dateStrings.filter(dateStr => !isValidDate(dateStr));

        return invalidDates.length > 0
            ? { invalidDate: invalidDates }
            : null;
    };
}

export function timeRangeValidator(startKey: string, endKey: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
        const startControl = group.get(startKey);
        const endControl = group.get(endKey);
        const start = startControl?.value;
        const end = endControl?.value;

        if (!start || !end) return null;

        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);

        const startMinute = startH * 60 + startM;
        const endMinute = endH * 60 + endM;

        clearSpecificError(startControl, 'invalidTimeRange');
        clearSpecificError(endControl, 'invalidTimeRange');
        clearSpecificError(startControl, 'sameTimeRange');
        clearSpecificError(endControl, 'sameTimeRange');

        if (startMinute === endMinute) {
            startControl?.setErrors({ ...(startControl.errors || {}), sameTimeRange: true });
            endControl?.setErrors({ ...(endControl.errors || {}), sameTimeRange: true });
            return { sameTimeRange: true };
        } else if (startMinute > endMinute) {
            startControl?.setErrors({ ...startControl.errors, invalidTimeRange: true });
            endControl?.setErrors({ ...endControl.errors, invalidTimeRange: true });
            return { invalidTimeRange: true };
        }

        return null;
    };
}


export function dateRangeValidator(startKey: string, endKey: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
        const startControl = group.get(startKey);
        const endControl = group.get(endKey);

        if (!startControl || !endControl) return null;

        clearSpecificError(startControl, 'invalidDateRange');
        clearSpecificError(endControl, 'invalidDateRange');

        const startDate = new Date(startControl.value);
        const endDate = new Date(endControl.value);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

        if (startDate.getTime() > endDate.getTime()) {
            group.get(startKey)?.setErrors({ ...(startControl.errors || {}), invalidDateRange: true });
            group.get(endKey)?.setErrors({ ...(startControl.errors || {}), invalidDateRange: true });

            return { invalidDateRange: true }
        }

        return null;
    }
}