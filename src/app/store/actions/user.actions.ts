import { createAction, props } from "@ngrx/store";
import { ICustomer, IProvider } from "../models/user.model";

export const userActions = {
    fetchUsers: createAction('[User] Fetch Both Customer & Provider'),
    fetchUsersSuccess: createAction('[User] Fetch Both Customer & Provider Success',
        props<{ customers: ICustomer[], providers: IProvider[] }>()
    ),
    fetchUsersFailure: createAction('[User] Fetch Both Customer & Provider', props<{ error: string }>()),




    fetchProviders: createAction('[User] Fetch Providers'),
    fetchProvidersSuccess: createAction('[User] Fetch Providers Success', props<{ providers: IProvider[] }>()),
    fetchProviderFailure: createAction('[User] Fetch Provider Failure', props<{ error: string }>()),

    updateProviderStatus: createAction('[User] Update Provider Status', props<{ status: string }>()),
}

export const customerActions = {
    fetchCustomers: createAction('[User] Fetch Customers'),
    fetchCustomersSuccess: createAction('[User] Fetch Customer Success', props<{ customers: ICustomer[] }>()),
    fetchCustomersFailure: createAction('[User] Fetch Customer Failure', props<{ error: string }>()),

    updateCustomer: createAction('[User] Update Customer', props<{ email: string, data: Partial<ICustomer> }>()),
    updateCustomerSuccess: createAction('[User] Update Customer Success', props<{ customer: ICustomer }>()),
    updateCustomerFailure: createAction('[User] Update Customer Failure', props<{ error: string }>()),
}

// export const providerActions = {
//     fetchProviders: createAction('[User] Fetch Providers'),
//     fetchProvidersSuccess: createAction('[User] Fetch Providers Success', props<{ providers: IProvider[] }>()),
//     fetchProviderFailure: createAction('[User] Fetch Provider Failure', props<{ error: string }>()),

//     updateProviderStatus: createAction('[User] Update Provider Status', props<{ status: string }>()),

// }