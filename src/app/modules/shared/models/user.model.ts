export interface IUser {
    email: string;
    username?: string;
    password: string;
    type: 'customer' | 'provider';
}