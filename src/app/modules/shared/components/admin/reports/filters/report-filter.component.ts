import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IFilterConfig, ReportCategoryType } from "../../../../../../core/models/admin-report.model";

@Component({
    selector: 'app-admin-report-filter',
    templateUrl: './report-filter.component.html',
    imports: [CommonModule, ReactiveFormsModule]
})
export class AdminReportFilterComponent {
    private readonly fb = inject(FormBuilder);

    @Input() filters: IFilterConfig[] = [];
    @Input() category: ReportCategoryType = 'booking';
    @Output() filterChange = new EventEmitter<any>();

    filterForm: FormGroup = this.fb.group({});

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['filters'] && changes['filters'].currentValue) {
            const group: any = {};
            this.filters.forEach(f => {
                group[f.name] = new FormControl('');
            });
            this.filterForm = this.fb.group(group);

            this.filterForm.valueChanges.subscribe(val => {
                this.filterChange.emit(val);
            });
        }
    }

    shouldShowField(filter: IFilterConfig): boolean {
        if (!filter.dependsOn) return true;
        const controlValue = this.filterForm.get(filter.dependsOn.name)?.value;
        return controlValue === filter.dependsOn.value;
    }
}