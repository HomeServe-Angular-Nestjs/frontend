import { createAction, props } from "@ngrx/store";
import { ICustomer, IProvider } from "../models/user.model";

export const userActions = {
    fetchCustomers: createAction('[User] Fetch Customers'),
    fetchCustomersSuccess: createAction('[User] Fetch Customer Success', props<{ customers: ICustomer[] }>()),
    fetchCustomerFailure: createAction('[User] Fetch Customer Failure', props<{ error: string }>()),

    fetchProviders: createAction('[User] Fetch Providers'),
    fetchProvidersSuccess: createAction('[User] Fetch Providers Success', props<{ providers: IProvider[] }>()),
    fetchProviderFailure: createAction('[User] Fetch Provider Failure', props<{ error: string }>()),

    fetchUsers: createAction('[User] Fetch Both Customer & Provider'),
    fetchUsersSuccess: createAction('[User] Fetch Both Customer & Provider Success',
        props<{ customers: ICustomer[], providers: IProvider[] }>()
    ),
    fetchUsersFailure: createAction('[User] Fetch Both Customer & Provider', props<{ error: string }>()),
}