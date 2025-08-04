import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonComponent } from "../../../../../../UI/button/button.component";
import { ToggleButtonComponent } from "../../../../../../UI/button/toggle-button.component";

@Component({
    selector: 'app-provider-rule-list',
    templateUrl: './rule-list.component.html',
    imports: [CommonModule, ButtonComponent, ToggleButtonComponent, FormsModule]
})
export class ProviderSlotRuleListComponent{
    slotRules = [{
        ruleName: "Weekend",
        description: "this is the description",
        startDate: "2025-08-01",
        endDate: "2025-09-01",
        daysOfWeek: ["Mon", "Tue", "Fri"],
        startTime: "14:17",
        endTime: "19:17",
        slotDuration: 30,
        breakDuration: 10,
        capacity: 5,
        isActive: true,
        priority: 1,
        excludeDates: ["2025-08-15", "2025-08-15"]
    }];

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