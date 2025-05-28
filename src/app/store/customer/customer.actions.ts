import { createAction, props } from "@ngrx/store";
import { ICustomer } from "../../core/models/user.model";

export const customerActions = {
    customerSuccessAction: createAction('[Customer] fetch customer customer success', props<{ customer: ICustomer }>()),
    customerFailureAction: createAction('[Customer] fetch customer customer failure', props<{ error: string }>()),

    fetchOneCustomer: createAction('[Customer] fetch customer'),
    updateCustomer: createAction('[Customer] update customer', props<{ updateData: Partial<ICustomer> }>()),
    updateAddToSaved: createAction('[Customer] update add to saved', props<{ providerId: string }>()),
    

}