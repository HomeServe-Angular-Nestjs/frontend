import { IPlan } from "../models/plan.model";
import { ITable, TableData, UserTableRow } from "../models/table.model";
import { IUserData } from "../models/user.model";

export const createAdminTableUI = (columns: string[], users: IUserData[]): TableData<UserTableRow> => {
    const filteredUser = users.filter(user => !user.isDeleted);
    return {
        columns,
        rows: filteredUser.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            contact: user.contact,
            status: user.isActive ? 'Active' : 'Blocked',
            joined: new Date(user.createdAt).toLocaleString(),
            actions: [
                {
                    id: user.id,
                    value: user.isActive,
                    toolTip: user.isActive ? 'Block' : 'Unblock',
                    action: 'status',
                    icon: user.isActive ? 'fa-user-slash' : 'fa-user-check',
                    styles: `${user.isActive ? 'text-red-400' : 'text-green-400'}`
                },
                {
                    id: user.id,
                    value: user.isDeleted,
                    toolTip: 'Delete',
                    action: 'delete',
                    icon: 'fa-trash',
                    styles: 'text-red-500'
                },
                {
                    id: user.id,
                    value: user.id,
                    toolTip: 'View',
                    action: 'view',
                    icon: 'fa-eye',
                    styles: 'text-blue-500'
                }
            ]
        }))
    };
};

export const createProviderBookingTables = (columns: string[], data: Record<string, any>[]) => {
    const rows = data.map(item => {
        const row: Record<string, any> = {};

        data.map(d => {
            console.log(d)
        })
        return row;
    });

    return {
        columns,
        rows
    };
};


export const createPlansTable = (columns: string[], plans: IPlan[]): ITable => {
    return {
        columns,
        rows: plans.map(plan => ({
            id: plan.id,
            'plan name': plan.name,
            pricing: `₹${plan.price}`,
            role: plan.role,
            'billing cycle': plan.duration,
            'created date': plan.createdAt,
            status: plan.isActive,
            actions: [
                {
                    toolTip: plan.isActive ? 'Deactivate Plan' : 'Activate Plan',
                    icon: plan.isActive ? 'fas fa-circle-check' : 'fas fa-circle-xmark',
                    styles: plan.isActive ? 'text-green-500' : 'text-red-400',
                    action: 'toggle',
                },
                {
                    toolTip: 'View Plan',
                    icon: 'fas fa-eye',
                    styles: 'text-blue-600',
                    action: 'view',
                },
                {
                    toolTip: 'Edit Plan',
                    icon: 'fas fa-edit',
                    styles: 'text-green-600',
                    action: 'edit',
                },
            ]
        }))
    };
};

