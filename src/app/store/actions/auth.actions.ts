import { createAction, props } from "@ngrx/store";
import { IUser, UserType } from "../../modules/shared/models/user.model";


export const authActions = {
    login: createAction('[Auth] Login', props<{ user: IUser }>()),

    loginSuccess: createAction('[Auth] Login Success', props<{ user: IUser }>()),

    loginFailure: createAction('[Auth] Login Failure', props<{ error: string }>()),

    googleLogin: createAction('[Auth] Google Login', props<{ userType: UserType }>()),

    // googleLoginSuccess: createAction('[Auth] Google Login', props<{ user: IUser }>()),

    setUserType: createAction('[Auth] Set User Type', props<{ userType: UserType }>()),

    logout: createAction('[Auth] Logout'),

    checkAuth: createAction('[Auth] Check Auth'),
}