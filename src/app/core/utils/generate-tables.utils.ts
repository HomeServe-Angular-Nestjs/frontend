import { ICustomer, IProvider } from "../../store/models/user.model";

export const createUserTable = (users: (ICustomer | IProvider)[]) => {
    return {
        // label: t,
        columns: ['id', 'username', 'email', 'contact', 'status', 'joined', 'actions'],
        rows: users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            contact: user.phone,
            status: user.isActive ? 'Active' : 'Blocked',
            joined: new Date(user.createdAt).toLocaleString(),
            actions: [
                {
                    id: user.id,
                    toolTip: user.isActive ? 'Block' : 'Unblock',
                    action: 'toggleStatus',
                    icon: user.isActive ? 'fa-user-slash' : 'fa-user-check',
                    styles: `${user.isActive ? 'text-red-400' : 'text-green-400'}`
                },
                {
                    id: user.id,
                    toolTip: 'Delete',
                    action: 'delete',
                    icon: 'fa-trash',
                    styles: 'text-red-500'
                },
                {
                    id: user.id,
                    toolTip: 'View',
                    action: 'view',
                    icon: 'fa-eye',
                    styles: 'text-blue-500'
                }
            ]
        }))
    };
}
