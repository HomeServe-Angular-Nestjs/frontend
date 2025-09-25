import { createAction, props } from "@ngrx/store";
import { IUser, UserType } from "../../modules/shared/models/user.model";

export const authActions = {
    login: createAction('[Auth] Login', props<{ user: IUser }>()),
    loginSuccess: createAction('[Auth] Login Success', props<{ email: string, id: string }>()),
    loginFailure: createAction('[Auth] Login Failure', props<{ error: string }>()),
    logout: createAction('[Auth] Logout', props<{ fromInterceptor?: boolean, message?: string }>()),
    logoutSuccess: createAction('[Auth] Logout success'),

    googleLogin: createAction('[Auth] Google Login', props<{ userType: UserType }>()),
    setUserType: createAction('[Auth] Set User Type', props<{ userType: UserType }>()),
    checkAuth: createAction('[Auth] Check Auth'),
};