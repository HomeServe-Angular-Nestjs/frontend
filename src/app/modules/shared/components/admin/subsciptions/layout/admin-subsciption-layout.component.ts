import { Component, OnDestroy, OnInit } from "@angular/core";
import { AdminViewPlansComponent } from "../view-plans/admin-view-plans.component";
import { AdminCreatePlansComponent } from "../create-plans/create-plans.component";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-admin-sub-layout',
    templateUrl: 'admin-subsciption-layout.component.html',
    imports: [CommonModule, AdminViewPlansComponent, AdminCreatePlansComponent]
})
export class AdminSubscriptionLayoutComponent implements OnInit, OnDestroy {

    isCreatePlanModalOpen = false;

    ngOnInit(): void {

    }

    ngOnDestroy(): void {

    }
}
