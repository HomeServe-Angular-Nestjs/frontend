import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

export interface UpgradeModalData {
    upgradeAmount: number;
    creditAmount: number;
    monthlyPrice: number;
    yearlyPrice: number;
    daysUsed: number;
    userType: 'customer' | 'provider';
}

@Component({
    selector: 'app-upgrade-modal',
    templateUrl: './upgrade-modal.component.html',
    styleUrls: ['./upgrade-modal.component.scss'],
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule]
})
export class UpgradeModalComponent {
    readonly dialogRef = inject(MatDialogRef<UpgradeModalComponent>);
    readonly data = inject<UpgradeModalData>(MAT_DIALOG_DATA);

    get isCustomerTheme(): boolean {
        return this.data.userType === 'customer';
    }

    formatAmount(value: number): string {
        return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    }

    formatCredit(value: number): string {
        return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
}