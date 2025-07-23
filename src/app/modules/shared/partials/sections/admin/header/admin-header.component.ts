import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedDataService } from '../../../../../../core/services/public/shared-data.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-header.component.html',
})
export class AdminHeaderComponent implements OnInit {
  private readonly _sharedData = inject(SharedDataService);


  header$ = this._sharedData.title$;

  ngOnInit(): void {

  }
}
