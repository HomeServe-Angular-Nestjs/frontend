import { ApprovalTableColumnConfig } from "./table.interfaces";

export const USER_TABLE_COLUMNS: ApprovalTableColumnConfig[] = [
    { key: 'id', label: 'ID', type: 'text' },
    { key: 'profile', label: 'Profile', type: 'image-two-text' },
    { key: 'documents', label: 'Documents', type: 'text' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'actions', label: 'Actions', type: 'actions' },
];
