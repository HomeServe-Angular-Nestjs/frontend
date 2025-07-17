import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { AdminService } from "../../../../../../core/services/admin.service";
import { AdminBookingTableComponent } from "../booking-table/admin-bookings-table.component";
import { IAdminBookingForTable } from "../../../../../../core/models/booking.model";
import { filter, map, Observable } from "rxjs";

@Component({
    selector: 'app-admin-bookings',
    templateUrl: './admin-bookings.component.html',
    imports: [CommonModule, AdminBookingTableComponent]
})
export class AdminBookingLayoutComponent implements OnInit {
    private readonly _adminService = inject(AdminService);

    bookings$!: Observable<IAdminBookingForTable[]>;


    ngOnInit(): void {
        console.log('ng')
        this._loadTable();
    }

    private _loadTable() {
        this.bookings$ = this._adminService.getBookings().pipe(
            map(res => {
                console.log(res.data)
                return res.data ?? [];
            })
        );
    }
}