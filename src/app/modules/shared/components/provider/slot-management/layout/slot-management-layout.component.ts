import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ButtonComponent } from "../../../../../../UI/button/button.component";
import { ProviderSlotRuleModalComponent } from "../slot-rule-modal/slot-rule-modal.component";
import { ProviderSlotRuleListComponent } from "../view-rules/rule-list.component";
import { IRuleFilter, ISlotRule } from "../../../../../../core/models/slot-rule.model";
import { SharedDataService } from "../../../../../../core/services/public/shared-data.service";
import { ProviderRuleFilterComponent } from "../rule-filters/rule-filters.component";

@Component({
    selector: 'app-provider-slot-management',
    templateUrl: './slot-management-layout.component.html',
    imports: [CommonModule, ButtonComponent, ProviderSlotRuleModalComponent, ProviderSlotRuleListComponent, ProviderRuleFilterComponent]
})
export class ProviderSlotManagementComponent implements OnInit {
    private readonly _sharedService = inject(SharedDataService);

    isOpenAddRuleModal = false;
    editableRule: ISlotRule | null = null;

    ngOnInit(): void {
        this._sharedService.setProviderHeader('Schedule Rule Management')
    }

    openCreateModal() {
        this.editableRule = null;
        this.isOpenAddRuleModal = true;
    }

    editRule(rule: ISlotRule) {
        this.editableRule = rule;
        this.isOpenAddRuleModal = true;
    }

    closeModal() {
        this.isOpenAddRuleModal = false;
        this.editableRule = null;
    }
}