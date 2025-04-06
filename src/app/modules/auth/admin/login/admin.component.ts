import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLoginComponent } from "../../../shared/components/admin/loginForm/admin-login.component";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, AdminLoginComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminLoginPageComponent {

}
