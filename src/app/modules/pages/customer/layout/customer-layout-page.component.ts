import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerHeaderComponent } from "../../../shared/partials/header/customer/header/header.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-customer-landing-page',
  standalone: true,
  imports: [CommonModule, CustomerHeaderComponent, RouterOutlet],
  templateUrl: './customer-layout-page.component.html',
  // styleUrls: ['./customer-landing-page.component.scss'],
})
export class CustomerLayoutPageComponent { }
