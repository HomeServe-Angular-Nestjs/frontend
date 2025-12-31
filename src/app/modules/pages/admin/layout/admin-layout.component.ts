import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from '../../../shared/partials/sections/admin/header/admin-header.component';
import { AdminSidebarComponent } from '../../../shared/partials/sections/admin/sidebar/admin-sidebar.component';


@Component({
  selector: 'app-admin-homepage',
  templateUrl: './admin-layout.component.html',
  imports: [CommonModule, AdminSidebarComponent, RouterOutlet, AdminHeaderComponent],


})
export class AdminHomepageComponent { }
