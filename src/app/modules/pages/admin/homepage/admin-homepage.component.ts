import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../../../shared/components/admin/sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from "../../../shared/partials/header/admin/admin-header.component";

@Component({
  selector: 'app-admin-homepage',
  templateUrl: './admin-homepage.component.html',
  styleUrls: ['./admin-homepage.component.scss'],
  imports: [CommonModule, AdminSidebarComponent, RouterOutlet, AdminHeaderComponent],
})
export class AdminHomepageComponent { }
