import { UserType } from "./user.model";

export interface IVerifyTokenResponse {
    email: string;
    exp: number;
    iat: number;
    id: string;
    type: UserType
}