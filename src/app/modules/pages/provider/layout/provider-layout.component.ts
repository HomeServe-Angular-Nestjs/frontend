import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderSidebarComponent } from '../../../shared/partials/sections/provider/sidebar/provider-sidebar.component';
import { RouterOutlet } from '@angular/router';
import { ProviderHeaderComponent } from "../../../shared/partials/sections/provider/header/provider-header.component";

@Component({
  selector: 'app-provider-layout',
  standalone: true,
  imports: [CommonModule, ProviderSidebarComponent, RouterOutlet, ProviderHeaderComponent],
  templateUrl: './provider-layout.component.html',
  styleUrl: './provider-layout.component.scss',
})
export class ProviderLayoutComponent { }
