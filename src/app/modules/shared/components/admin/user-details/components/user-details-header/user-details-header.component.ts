import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { AdminService } from '../../../../../../../core/services/admin.service';
import { ToastNotificationService } from '../../../../../../../core/services/public/toastr.service';
import { ConfirmDialogComponent } from '../../../../../partials/shared/confirm-dialog-box/confirm-dialog.component';
import { IProviderDetailsProfile, IUserDetailsProfile, VerificationStatusType } from '../../../../../../../core/models/user-details.model';
import { UType } from '../../../../../../../core/models/user.model';

@Component({
    selector: 'app-user-details-header',
    standalone: true,
    host: { class: 'block' },
    imports: [CommonModule],
    templateUrl: './user-details-header.component.html'
})
export class UserDetailsHeaderComponent {
    private readonly _adminService = inject(AdminService);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _dialog = inject(MatDialog);
    private readonly _location = inject(Location);

    @Input() profile!: IUserDetailsProfile | IProviderDetailsProfile;
    @Input() role: UType = 'customer';

    @Output() statusChanged = new EventEmitter<boolean>();
    @Output() verificationChanged = new EventEmitter<VerificationStatusType>();

    get isProvider(): boolean {
        return this.role === 'provider';
    }

    get profession(): string {
        return this.isProvider ? (this.profile as IProviderDetailsProfile).profession : '';
    }

    get verificationStatus(): VerificationStatusType | undefined {
        return this.isProvider ? (this.profile as IProviderDetailsProfile).verificationStatus : undefined;
    }

    get initial(): string {
        return (this.profile.fullname || this.profile.username || '?').charAt(0).toUpperCase();
    }

    goBack(): void {
        this._location.back();
    }

    onToggleStatus(): void {
        const isActive = this.profile.isActive;
        const dialogRef = this._dialog.open(ConfirmDialogComponent, {
            data: {
                title: isActive ? 'Block User' : 'Unblock User',
                message: `Are you sure you want to ${isActive ? 'block' : 'unblock'} this user?`
            }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (!confirmed) return;
            this._adminService.updateStatus({
                userId: this.profile.id,
                status: isActive,
                role: this.role
            }).subscribe({
                next: (success) => {
                    if (success) {
                        this._toastr.success(`User ${isActive ? 'blocked' : 'unblocked'}`);
                        this.statusChanged.emit(!isActive);
                    }
                },
                error: () => this._toastr.error('Something went wrong. Please try again.')
            });
        });
    }

    onVerify(): void {
        const dialogRef = this._dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Verify Provider',
                message: 'Are you sure you want to mark this provider as verified?'
            }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (!confirmed) return;
            this._adminService.verifyProvider({ providerId: this.profile.id, status: 'verified' }).subscribe({
                next: (res) => {
                    if (res.success) {
                        this._toastr.success('Provider verified successfully');
                        this.verificationChanged.emit('verified');
                    }
                },
                error: () => this._toastr.error('Something went wrong. Please try again.')
            });
        });
    }

    statusPillClass(isActive: boolean): string {
        return isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    }

    verificationPillClass(status: VerificationStatusType): string {
        switch (status) {
            case 'verified': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    }
}
