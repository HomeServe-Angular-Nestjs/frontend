import { TableData } from "../models/table.model";
import { IUserData } from "../models/user.model";

export const createAdminTableUI = (columns: string[], users: IUserData[]): TableData => {
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


    console.log('columns: ', columns)
    console.log('rows: ', rows)

    return {
        columns,
        rows
    };
};

