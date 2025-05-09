import { createAction, props } from "@ngrx/store";
import { ICustomer, IProvider } from "../../core/models/user.model";

export const userActions = {
    fetchUsers: createAction('[User] Fetch Both Customer & Provider'),
    fetchUsersSuccess: createAction('[User] Fetch Both Customer & Provider Success', props<{ customers: ICustomer[], providers: IProvider[] }>()),
    fetchUsersFailure: createAction('[User] Fetch Both Customer & Provider', props<{ error: string }>()),

    fetchProviders: createAction('[User] Fetch Providers'),
    fetchProvidersSuccess: createAction('[User] Fetch Providers Success', props<{ providers: IProvider[] }>()),
    fetchProvidersFailure: createAction('[User] Fetch Provider Failure', props<{ error: string }>()),

    partialUpdateProvider: createAction('[User] Partial update provider', props<{ updateData: Partial<IProvider> }>()),
    partialUpdateProviderSuccess: createAction('[User] Partial update provider success', props<{ provider: IProvider }>()),
    partialUpdateProviderFailure: createAction('[User] Partial update provider failure', props<{ error: string }>()),

    partialUpdateCustomer: createAction('[User] Update Customer', props<{ updateData: Partial<ICustomer> }>()),
    partialUpdateCustomerSuccess: createAction('[User] Update Customer Success', props<{ customer: ICustomer }>()),
    partialUpdateCustomerFailure: createAction('[User] Update Customer Failure', props<{ error: string }>()),

    searchCustomers: createAction('[User] Search Customers', props<{ searchTerm: string }>()),
    searchCustomersSuccess: createAction('[user] Search Customers success', props<{ customers: ICustomer[] }>()),
    searchCustomersFailure: createAction('[User] Search Customers Failure', props<{ error: string }>()),

    searchProviders: createAction('[User] Search Providers', props<{ searchTerm: string }>()),
    searchProvidersSuccess: createAction('[user] Search Providers success', props<{ providers: IProvider[] }>()),
    searchProvidersFailure: createAction('[User] Search Providers Failure', props<{ error: string }>()),
}