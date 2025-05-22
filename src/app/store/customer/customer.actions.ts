import { createAction, props } from "@ngrx/store";
import { ICustomer } from "../../core/models/user.model";

export const customerActions = {
    fetchOneCustomer: createAction('[Customer] fetch customer customer'),
    fetchOneCustomerSuccess: createAction('[Customer] fetch customer customer success', props<{ customer: ICustomer }>()),
    fetchOneCustomerFailure: createAction('[Customer] fetch customer customer failure', props<{ error: string }>()),

}