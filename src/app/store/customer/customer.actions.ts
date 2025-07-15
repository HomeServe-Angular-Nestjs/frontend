import { createAction, props } from "@ngrx/store";
import { IChangePassword, ICustomer, ICustomerProfileData } from "../../core/models/user.model";

export const customerActions = {
    customerSuccessAction: createAction('[Customer] fetch customer customer success', props<{ customer: ICustomer }>()),
    customerFailureAction: createAction('[Customer] fetch customer customer failure', props<{ error: string }>()),

    fetchOneCustomer: createAction('[Customer] fetch customer'),
    updateCustomer: createAction('[Customer] update customer', props<{ updateData: Partial<ICustomer> }>()),
    updateAddToSaved: createAction('[Customer] update add to saved', props<{ providerId: string }>()),
    updateProfile: createAction('[Customer] update profile', props<{ profileData: ICustomerProfileData }>()),
    changePassword: createAction('[Customer] change password', props<{ passwordData: IChangePassword }>()),
    changeAvatar: createAction('[Customer] change avatar', props<{ formData: FormData }>()),
    changeReviewedStatus: createAction('[Customer] change reviewed status', props<{ status: boolean }>()),
}