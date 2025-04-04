import { IUser, UserType } from "../../modules/shared/models/user.model";

export type StatusType = 'pending' | 'loading' | 'authenticated' | 'error';

export interface AuthState {
    user: IUser | null;
    status: StatusType;
    error: string | null;
    type: UserType | null;
}