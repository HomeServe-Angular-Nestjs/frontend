export const MESSAGES_ENV: { [key: string]: { [key: string]: { [key: string]: string } } } = {
    errorMessages: {
        email: {
            required: 'Email is required.',
            email: 'Invalid email.',
        },
        username: {
            required: 'Username is required.',
            minLength: 'Username must be at least 3 characters.',
        },
        password: {
            required: 'Password is required.',
            pattern: 'Password does not meet the required format.',
        },
    }
}