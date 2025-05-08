import { UserType } from "../../modules/shared/models/user.model";

export type StatusType = 'pending' | 'loading' | 'authenticated' | 'error';

export interface AuthState {
    email: string | null;
    status: StatusType;
    error: string | null;
    type: UserType | null;
}