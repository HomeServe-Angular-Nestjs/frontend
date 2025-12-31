import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { IOfferedService, IToggleServiceStatus, IUpdateSubservice } from "../../../../../../core/models/offeredService.model";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { OfferedServicesService } from "../../../../../../core/services/service-management-test.service";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../../../shared/confirm-dialog-box/confirm-dialog.component";
import { IResponse } from "../../../../models/response.model";

@Component({
    selector: "app-service-list-view",
    imports: [CommonModule, RouterLink],
    templateUrl: './service-list-view.component.html'
})
export class ServiceListViewComponent {
    private readonly _serviceService = inject(OfferedServicesService);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _dialog = inject(MatDialog);
    private readonly _router = inject(Router);

    @Input({ required: true }) offeredServices!: IOfferedService[];
    @Output() updateEvent = new EventEmitter<IToggleServiceStatus>();
    @Output() updateSubServiceEvent = new EventEmitter<IUpdateSubservice>();

    expandedSubServices: Record<string, boolean> = {};

    updateService(updateData: IToggleServiceStatus) {
        this.updateEvent.emit(updateData);
    }

    updateSubservice(updateData: IUpdateSubservice) {
        this.updateSubServiceEvent.emit(updateData);
    }

    goToEditPage(index: number, id: string) {
        this._router.navigate(['provider', 'manage_services', 'edit', id], {
            queryParams: { subIdx: index }
        });
    }

    addSubService(id: string) {
        this._router.navigate(['provider', 'manage_services', 'edit', id], {
            queryParams: { addSs: true }
        });
    }

    deleteSub(serviceId: string, subId: string) {
        this._openConfirmationBox(
            'Are you sure you want to continue?',
            'Deleting this item may result in temporary data loss. Proceed with caution.'
        ).afterClosed()
            .subscribe(confirm => {
                if (!confirm) return;

                this._serviceService.removeSubService(serviceId, subId).subscribe({
                    next: (response) => {
                        this.offeredServices = this.offeredServices.map(service => ({
                            ...service,
                            subService: service.subService.filter(sub => sub.id !== subId)
                        }));
                        this._afterApiCall(response);
                    },
                    error: (err) => {
                        this._toastr.error(err);
                        console.error(err);
                    }
                });
            });
    }

    removeService(id: string) {
        this._openConfirmationBox(
            'Are you sure you want to continue?',
            'Deleting this item may result in temporary data loss. Proceed with caution.'
        ).afterClosed()
            .subscribe(confirm => {
                if (!confirm) return;
                this._serviceService.removeService(id).subscribe({
                    next: (response) => {
                        if (response.success) {
                            this.offeredServices = this.offeredServices.filter(service => service.id !== id);
                            this._toastr.success(response.message);
                        } else {
                            this._toastr.error(response.message);
                        }
                    },
                    error: (err) => {
                        this._toastr.error('Oops, something went wrong.');
                        console.error(err);
                    }
                });
            });
    }

    toggleSub(serviceId: string): void {
        this.expandedSubServices[serviceId] = !this.expandedSubServices[serviceId];
    }

    private _afterApiCall(response: IResponse) {
        if (response.success) {
            this._toastr.success(response.message);
        } else {
            this._toastr.error(response.message);
        }
    }

    private _openConfirmationBox(title: string, message: string) {
        return this._dialog.open(ConfirmDialogComponent, {
            data: { title, message }
        });
    }
}
