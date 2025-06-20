import { VerificationStatusType } from "./user.model";

export interface TableRowBase {
    id: string;
    status: string | VerificationStatusType;
    actions: TableAction[];
}

export interface TableAction {
    id: string;
    value: boolean | string;
    toolTip: string;
    action: 'toggle' | 'delete' | 'view' | string;
    icon?: string;
    styles?: string;
}

export interface UserTableRow {
    id: string;
    username: string;
    email: string;
    contact?: string;
    status: string;
    joined: string;
    actions: TableAction[];
    [key: string]: any; //? this allows row column access.
}

export interface ApprovalTableRow {
    id: string;
    profile: {
        avatar: string;
        name: string;
        email: string;
    },
    document: number;
    date: Date;
    status: VerificationStatusType;
    actions: TableAction
}

export interface TableData<T> {
    columns: string[];
    rows: T[];
}
