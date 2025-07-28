import { ApprovalTableColumnConfig, TableRowData } from "./table.interfaces";

export function mapApprovalsTableData(raw: any[], columns: ApprovalTableColumnConfig[]): TableRowData[] {
    return raw.map((approvalData) => {
        return columns.map(({ key, type }) => {
            let value: any;

            switch (key) {
                case 'profile':
                    value = {
                        image: approvalData.avatar,
                        title: approvalData.name,
                        subtitle: approvalData.email,
                    };
                    break;

                case 'documents':
                    value = `${approvalData.documentCount} docs`;
                    break;

                case 'date':
                    value = new Date(approvalData.date).toLocaleDateString();
                    break;

                case 'status':
                    value = approvalData.verificationStatus;
                    break;

                case 'actions':
                    value = approvalData.id;
                    break;

                default:
                    value = approvalData[key];
            }

            return { type, value, key };
        });
    });
}
