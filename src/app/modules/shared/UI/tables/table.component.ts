import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ICustomer, IProvider, UsersViewModel } from '../../../../store/models/user.model';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
})
export class TableComponent implements OnChanges {
  @Input({ required: true }) tableData!: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableData']) {
      console.log(this.tableData)
    }
  }

}
