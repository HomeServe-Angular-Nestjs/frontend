import { ICustomer, IProvider } from "../models/user.model";

export const createUserTable = (users: (ICustomer | IProvider)[]) => {
    const filteredUser = users.filter(user => !user.isDeleted);
    return {
        // label: t,
        columns: ['id', 'username', 'email', 'contact', 'status', 'joined', 'actions'],
        rows: filteredUser.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            contact: user.phone,
            status: user.isActive ? 'Active' : 'Blocked',
            joined: new Date(user.createdAt).toLocaleString(),
            actions: [
                {
                    id: user.id,
                    value: user.isActive,
                    toolTip: user.isActive ? 'Block' : 'Unblock',
                    action: 'toggleStatus',
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
}
