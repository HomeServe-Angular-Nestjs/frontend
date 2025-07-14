import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-provider-header',
  templateUrl: './provider-header.component.html',
  imports: [CommonModule, RouterLink],
})
export class ProviderHeaderComponent { }
