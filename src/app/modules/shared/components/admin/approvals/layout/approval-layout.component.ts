import { Component, inject, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { AdminApprovalOverviewComponent } from "../overview/overview.component";
import { AdminApprovalFilterComponent } from "../filters/approval-filter.component";
import { filter, map } from "rxjs";
import { AdminService } from "../../../../../../core/services/admin.service";
import { IApprovalTableDetails } from "../../../../../../core/models/user.model";
import { CommonModule } from "@angular/common";
import { USER_TABLE_COLUMNS } from "../../../../../../core/utils/generate-tables/table.configs";
import { TableRowData } from "../../../../../../core/utils/generate-tables/table.interfaces";
import { mapApprovalsTableData } from "../../../../../../core/utils/generate-tables/table.mapper";
import { TableWrapperComponent } from "../../../../partials/shared/table/layout/table-wrapper.component";
import { TextCellComponent } from "../../../../partials/shared/table/cells/table-cell-text.component";
import { ImageTwoTextCellComponent } from "../../../../partials/shared/table/cells/table-cell-2text-img.component";

@Component({
    selector: 'app-admin-approval-layout',
    templateUrl: './approval-layout.component.html',
    imports: [CommonModule, AdminApprovalOverviewComponent, AdminApprovalFilterComponent, TableWrapperComponent, TextCellComponent, ImageTwoTextCellComponent],
})
export class AdminApprovalLayoutComponent implements OnInit {
    private readonly _adminService = inject(AdminService);

    @ViewChild('textCell', { static: true }) textCellTemplate!: TemplateRef<any>;
    @ViewChild('imageTwoTextCell', { static: true }) imageTwoTextCellTemplate!: TemplateRef<any>;
    @ViewChild('dateCell', { static: true }) dateCellTemplate!: TemplateRef<any>;
    @ViewChild('badgeCell', { static: true }) badgeCellTemplate!: TemplateRef<any>;
    @ViewChild('actionsCell', { static: true }) actionsCellTemplate!: TemplateRef<any>;

    cellTypeTemplates: { [key: string]: TemplateRef<any> } = {};

    columns!: string[];
    rows!: TableRowData[];

    ngOnInit(): void {
        this._adminService.fetchApprovalTableData().pipe(
            map((response => response.data)),
            filter((data): data is IApprovalTableDetails[] => Array.isArray(data)),
        ).subscribe(data => {
            this.columns = USER_TABLE_COLUMNS.map(col => col.label);
            this.rows = mapApprovalsTableData(data, USER_TABLE_COLUMNS);

            console.log(this.columns)
            console.log(this.rows)
        });

        this.cellTypeTemplates = {
            text: this.textCellTemplate,
            'image-two-text': this.imageTwoTextCellTemplate,
            date: this.dateCellTemplate,
            badge: this.badgeCellTemplate,
            actions: this.actionsCellTemplate,
        };
    }
    row = [
        {
            "type": "text",
            "value": "6818655c07a9d657f375a727",
            "key": "id"
        },
        {
            "type": "image-two-text",
            "value": {
                "image": "http://res.cloudinary.com/drhrf2oc5/image/upload/v1746429479/homeserve/xfuyisy4xn26gawfoafv.png",
                "title": "Muhammed Sajid S",
                "subtitle": "sajid189210@gmail.com"
            },
            "key": "profile"
        },
        {
            "type": "text",
            "value": "1 docs",
            "key": "documents"
        },
        {
            "type": "date",
            "value": "5/5/2025",
            "key": "date"
        },
        {
            "type": "badge",
            "value": "pending",
            "key": "status"
        },
        {
            "type": "actions",
            "value": "6818655c07a9d657f375a727",
            "key": "actions"
        }
    ]
}