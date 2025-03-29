export type UserType = 'customer' | 'provider';
export interface IUser {
    email: string;
    username?: string;
    password?: string;
    type: UserType;
}