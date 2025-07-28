export type ApprovalTableColumnType =
    | 'text'
    | 'image-text'
    | 'image-two-text'
    | 'date'
    | 'badge'
    | 'actions';


export interface ApprovalTableColumnConfig {
    key: string;
    label: string;
    type: ApprovalTableColumnType;
}


export interface ApprovalTableCell {
    type: ApprovalTableColumnType;
    value: any;
}

export type TableRowData = ApprovalTableCell[];