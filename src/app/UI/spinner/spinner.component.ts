import { Component, inject, Input, OnInit } from '@angular/core';
import { NgxSpinnerModule, NgxSpinnerService, Size } from "ngx-spinner";
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/public/loading.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading-spinner',
  imports: [CommonModule, NgxSpinnerModule],
  template: `
    <ngx-spinner
      [bdColor]="bdColor"
      [size]="size"
      [color]="color"
      [type]="type">

        <p style="color: gray; font-size: 16px;">{{text}}</p>
    </ngx-spinner>
  `
})
export class LoadingSpinnerComponent implements OnInit {
  private readonly _spinner = inject(NgxSpinnerService);
  private readonly _loadingService = inject(LoadingService);
  private readonly _router = inject(Router);

  @Input() color: string = '#fff';
  @Input() size: Size = 'medium';
  @Input() bdColor = 'rgba(255, 255, 255, 0.7)';
  @Input() type = 'square-jelly-box';
  text = 'Loading...';

  ngOnInit(): void {
    this._loadingService.isLoading$.subscribe(isLoading => {
      const url = this._router.url.split('/');
      if (url.includes('provider')) this.color = '#16a34a';
      else if (url.includes('admin')) this.color = 'indigo';
      else this.color = 'blue';

      this.text = this._loadingService.text ;
      isLoading ? this.show() : this.hide();
    });
  }

  show() {
    this._spinner.show();
  }

  hide() {
    this._spinner.hide();
  }
}
