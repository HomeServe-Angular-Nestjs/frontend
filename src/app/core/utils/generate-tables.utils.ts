import { ICustomer, IProvider } from "../../store/models/user.model";

export const createUserTable = (users: (ICustomer | IProvider)[]) => {
    return {
        columns: ['customerId', 'username', 'email', 'contact', 'status', 'joined', 'actions'],
        rows: users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            contact: user.phone,
            status: user.isActive ? 'Active' : 'Blocked',
            joined: user.createdAt,
            actions: [
                {
                    id: user.id,
                    toolTip: user.isActive ? 'Block' : 'Unblock',
                    action: 'toggleStatus',
                    icon: user.isActive ? 'fa-user-slash' : 'fa-user-check'
                },
                {
                    id: user.id,
                    toolTip: 'Delete',
                    action: 'delete',
                    icon: 'fa-trash'
                },
                {
                    id: user.id,
                    toolTip: 'View',
                    action: 'view',
                    icon: 'fa-eye'
                }
            ]
        }))
    };
}
