import { CommonModule } from "@angular/common";
import { Component, } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DebounceService } from "../../../../../../core/services/public/debounce.service";

@Component({
    selector: 'app-admin-approval-filter',
    templateUrl: './approval-filter.component.html',
    imports: [CommonModule, FormsModule],
    providers: [DebounceService]
})
export class AdminApprovalFilterComponent {
    searchTerm: string = '';
    verificationStatus: string = '';
    selectedSpecialization: string = '';
    certifiedOnly: boolean = false;
    languageFilter: string = '';
    selectedDate: string = '';

    specializationOptions: string[] = [
        'Electrical Maintenance and Repair',
        'Residential Electrical Services',
        'Commercial Electrical Solutions',
        'Smart Home Electrical Integration',
        'Electrical Safety Auditing'
    ];
}