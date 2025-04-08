export type UserType = 'customer' | 'provider' | 'admin';
export interface IUser {
    email: string;
    username?: string;
    password?: string;
    type: UserType;
}
