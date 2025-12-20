import { Component, inject, OnInit } from '@angular/core';
import { SharedDataService } from '../../../../../../core/services/public/shared-data.service';
import { AdminCategoryProfessionComponent } from "../profession/profession.component";
import { AdminCategoryServiceComponent } from "../service/service.component";

@Component({
  selector: 'app-admin-category',
  templateUrl: './category-layout.component.html',
  imports: [AdminCategoryProfessionComponent, AdminCategoryServiceComponent],
})
export class AdminCategoryLayoutComponent implements OnInit {
  private readonly _sharedService = inject(SharedDataService);

  ngOnInit(): void {
    this._sharedService.setAdminHeader('Category Management');
  }
}
