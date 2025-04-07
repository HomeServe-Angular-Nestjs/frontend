import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table'
import { TableComponent } from "../../../UI/tables/table.component";
import { Store } from '@ngrx/store';
import { userActions } from '../../../../../store/actions/user.actions';
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  // styleUrls: ['./user-management.component.scss'],
  imports: [CommonModule, MatTableModule, TableComponent],
})
export class UserManagementComponent implements OnInit {
  private store = inject(Store);
  ngOnInit(): void {
    console.log('hello')
    this.store.dispatch(userActions.fetchUsers());
  }
}
