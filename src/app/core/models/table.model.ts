export interface TableAction {
    id: string;
    value: boolean | string;
    toolTip: string;
    action: 'toggle' | 'delete' | 'view' | string;
    icon?: string;
    styles?: string;
}

export interface TableRow {
    id: string;
    username: string;
    email: string;
    contact?: string;
    status: string;
    joined: string;
    actions: TableAction[];
    [key: string]: any; //? this allows row column access.
}

export interface TableData {
    columns: string[];
    rows: TableRow[];
}
