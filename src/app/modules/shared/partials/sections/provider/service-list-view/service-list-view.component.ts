import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { IOfferedService, ISubService, IToggleServiceStatus, IUpdateSubservice } from "../../../../../../core/models/offeredService.model";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { Store } from "@ngrx/store";
import { offeredServiceActions } from "../../../../../../store/offered-services/offeredService.action";
import { OfferedServicesService } from "../../../../../../core/services/service-management.service";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../../../shared/confirm-dialog-box/confirm-dialog.component";

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
    private readonly _store = inject(Store);

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
        this._router.navigate(['provider', 'profiles', 'service_offered', 'edit', id], {
            queryParams: { subIdx: index }
        });
    }

    addSubService(id: string) {
        this._router.navigate(['provider', 'profiles', 'service_offered', 'edit', id], {
            queryParams: { addSs: true }
        });
    }

    deleteSub(serviceId: string, subId: string) {
        // this.offeredServices = this.offeredServices.map((service: IOfferedService) => ({
        //     ...service,
        //     subService: service.subService.filter((sub: ISubService) => sub.id !== subId)
        // }));

        this._store.dispatch(offeredServiceActions.updateSubService({
            updateData: {
                id: serviceId,
                subService: { id: subId, isDeleted: true }
            }
        }));
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

    private _openConfirmationBox(title: string, message: string) {
        return this._dialog.open(ConfirmDialogComponent, {
            data: { title, message }
        });
    }
}