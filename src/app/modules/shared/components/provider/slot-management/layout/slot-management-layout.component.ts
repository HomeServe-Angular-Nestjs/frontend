import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ButtonComponent } from "../../../../../../UI/button/button.component";
import { ProviderSlotRuleModalComponent } from "../slot-rule-modal/slot-rule-modal.component";

@Component({
    selector: 'app-provider-slot-management',
    templateUrl: './slot-management-layout.component.html',
    imports: [CommonModule, ButtonComponent, ProviderSlotRuleModalComponent]
})
export class ProviderSlotCreationComponent {
    isOpenAddRuleModal = false;
}