import { createAction, props } from "@ngrx/store";
import { IUser, UserType } from "../../modules/shared/models/user.model";
import { StatusType } from "../models/auth.model";


export const authActions = {
    login: createAction('[Auth] Login', props<{ user: IUser }>()),

    loginSuccess: createAction('[Auth] Login Success', props<{ email: string }>()),

    loginFailure: createAction('[Auth] Login Failure', props<{ error: string }>()),

    googleLogin: createAction('[Auth] Google Login', props<{ userType: UserType }>()),

    setUserType: createAction('[Auth] Set User Type', props<{ userType: UserType }>()),

    logout: createAction('[Auth] Logout', props<{ userType: UserType }>()),

    checkAuth: createAction('[Auth] Check Auth'),
};