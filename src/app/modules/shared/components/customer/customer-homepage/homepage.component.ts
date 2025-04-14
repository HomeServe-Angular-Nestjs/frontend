import { Component } from '@angular/core';
import { CustomerHeaderComponent } from '../../../UI/header/customer/header/header.component';

@Component({
  selector: 'app-customer-homepage',
  imports: [CustomerHeaderComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class CustomerHomepageComponent {

}
