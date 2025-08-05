import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonComponent } from "../../../../../../UI/button/button.component";
import { ToggleButtonComponent } from "../../../../../../UI/button/toggle-button.component";
import { SlotRuleService } from "../../../../../../core/services/slot-rule.service";
import { BehaviorSubject, map, Observable, of } from "rxjs";
import { ISlotRule } from "../../../../../../core/models/slot-rule.model";

@Component({
    selector: 'app-provider-rule-list',
    templateUrl: './rule-list.component.html',
    imports: [CommonModule, ButtonComponent, ToggleButtonComponent, FormsModule]
})
export class ProviderSlotRuleListComponent implements OnInit {
    private readonly _slotRuleService = inject(SlotRuleService);

    slotRules$ = this._slotRuleService._slotRule$;

    ngOnInit(): void {
        this._slotRuleService.fetchRules().subscribe(response => {
            this._slotRuleService.setSlotRules(response.data ?? []);
        });
    }

    onEdit(slot: any) {
        // Trigger edit logic or open modal
        console.log('Edit clicked:', slot);
    }

    onDelete(slot: any) {
        // Trigger delete confirmation
        console.log('Delete clicked:', slot);
    }

    handleToggle(event: any) {
        console.log(event);
    }
}