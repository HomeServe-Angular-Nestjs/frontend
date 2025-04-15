import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CustomerHeaderComponent } from '../../../shared/partials/sections/customer/header/header.component';

@Component({
  selector: 'app-customer-landing-page',
  standalone: true,
  imports: [CommonModule, CustomerHeaderComponent, RouterOutlet],
  templateUrl: './customer-layout-page.component.html',
  // styleUrls: ['./customer-landing-page.component.scss'],
})
export class CustomerLayoutPageComponent { }
