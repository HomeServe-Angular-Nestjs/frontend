export type UserType = 'customer' | 'provider' | 'admin';
export interface IUser {
    id?: string;
    email: string;
    username?: string;
    password?: string;
    type: UserType;
}
