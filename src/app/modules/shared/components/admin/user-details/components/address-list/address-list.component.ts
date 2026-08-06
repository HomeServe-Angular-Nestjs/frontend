import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IAddressDetail } from '../../../../../../../core/models/user-details.model';

@Component({
    selector: 'app-address-list',
    standalone: true,
    host: { class: 'block' },
    imports: [CommonModule],
    templateUrl: './address-list.component.html'
})
export class AddressListComponent {
    @Input() addresses: IAddressDetail[] = [];
}
