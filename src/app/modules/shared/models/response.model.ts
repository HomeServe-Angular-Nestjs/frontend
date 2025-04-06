import { UserType } from "./user.model";

export interface IVerifyTokenResponse {
    email: string;
    exp: number;
    iat: number;
    id: string;
    type: UserType
}

export interface IResponse {
    success: boolean,
    message: string,
    data?: any
}

export interface ResponseInterface<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: {
        code?: string;
        details?: any;
        stack?: string;
    } | null;
    meta?: {
        timestamp: string; //* ISO format
        requestId?: string;
        duration?: number; //* in ms
    };
}