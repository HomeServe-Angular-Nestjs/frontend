import { VerificationStatusType } from "./user.model";

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

export interface TableData<T> {
    columns: string[];
    rows: T[];
}

export interface ITableAction {
    toolTip: string;
    icon: string;
    styles?: string;
    action: string;
}

export interface ITableRow {
    [key: string]: any;
    actions?: ITableAction[];
}

export interface ITable {
    columns: string[];
    rows: ITableRow[];
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
}

export interface ApprovalTableActions {
    id: string;
    value: boolean | string;
    action: boolean;
    icon?: string;
    styles?: string;
}