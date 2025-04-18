import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-service-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './service-view.component.html',
})
export class ServiceViewComponent { }
