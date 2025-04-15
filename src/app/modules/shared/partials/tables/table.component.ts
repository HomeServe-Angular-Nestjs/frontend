import { Component, Input, OnChanges, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ICustomer, IProvider, UsersViewModel } from '../../../../store/models/user.model';
import { TableAction, TableData, TableRow } from '../../../../store/models/table.model';
import { UserType } from '../../models/user.model';
// import { ChangeDateFormatPipe } from '../../../../core/pipes/change-date-format.pipe';

@Component({
  selector: 'app-table',
  standalone: true,
  templateUrl: './table.component.html',
  imports: [CommonModule],
})
export class TableComponent implements OnChanges {
  @Input({ required: true }) tableData!: TableData;
  @Output() actionTriggered = new EventEmitter()

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableData']) {
      console.log(this.tableData)
    }
  }
}
