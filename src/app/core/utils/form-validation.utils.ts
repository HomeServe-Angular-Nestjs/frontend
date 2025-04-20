import { AbstractControl } from "@angular/forms";

export const FORM_VALIDATION_ERROR_MESSAGES: { [errorType: string]: string } = {
    required: '$FIELD is required.',
    minlength: '$FIELD must be at least $REQUIRED_LENGTH characters.',
    maxlength: '$FIELD must be no more than $REQUIRED_LENGTH characters.',
    email: 'Please enter a valid email address.',
    pattern: '$FIELD format is invalid.',
    min: '$FIELD must be at least $MIN.',
    max: '$FIELD must be at most $MAX.',
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
    if (!control) return 'provider correct credentials';
    if (control.errors) {
        for (const errorKey in control.errors) {
            const template = FORM_VALIDATION_ERROR_MESSAGES[errorKey];

            if (template) {
                const errorDetails = control.errors[errorKey];

                const message = template
                    .replace(/\$FIELD/g, toTitleCase(fieldName))
                    .replace(/\$REQUIRED_LENGTH/g, errorDetails?.requiredLength ?? '')
                    .replace(/\$MIN/g, errorDetails?.min ?? '')
                    .replace(/\$MAX/g, errorDetails?.max ?? '');

                return message;
            } else {
                return `${toTitleCase(fieldName)} has an error (${errorKey})`;
            }
        }
    }
    return null;
}
