export interface TableAction {
    id: string | number;
    toolTip: string;
    action: 'toggleStatus' | 'delete' | 'view';
    icon?: string;
    styles?: string;
}

export interface TableRow {
    id: string | number;
    username: string;
    email: string;
    contact: string;
    status: string;
    joined: string;
    actions: TableAction[];
    [key: string]: any; //? this allows row column access.
}

export interface TableData {
    columns: string[];
    rows: TableRow[];
}
