import { Component, Input, OnChanges, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableData } from '../../../../../core/models/table.model';

@Component({
  selector: 'app-table',
  standalone: true,
  templateUrl: './table.component.html',
  imports: [CommonModule],
})
export class TableComponent implements OnChanges {
  @Input({ required: true }) tableData!: TableData;
  @Output() actionTriggeredEvent = new EventEmitter()

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableData']) {
    }
  }

}
