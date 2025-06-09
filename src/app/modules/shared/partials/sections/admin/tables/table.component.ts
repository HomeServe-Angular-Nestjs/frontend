import { Component, Input, OnChanges, Output, SimpleChanges, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableData, TableRow } from '../../../../../../core/models/table.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog-box/confirm-dialog.component';

@Component({
  selector: 'app-table',
  standalone: true,
  templateUrl: './table.component.html',
  imports: [CommonModule],
})
export class TableComponent implements OnChanges {
  private _dialog = inject(MatDialog)

  @Input({ required: true }) tableData!: TableData;
  @Output() actionTriggeredEvent = new EventEmitter()

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableData']) {
    }
  }

  emitAction(action: string, value: boolean | string | number, row: TableRow) {
    if (action === 'status') {
      const isActive = row.status === 'Active';
      const nextStatus = isActive ? 'Block' : 'Unblock';

      const dialogRef = this._dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Confirm Action',
          message: `Are you sure you want to ${nextStatus.toLowerCase()} this user?`
        }
      });

      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          row.status = isActive ? 'Blocked' : 'Active';

          const statusAction = row.actions.find((a: any) => a.action === 'status');
          if (statusAction) {
            statusAction.value = !isActive;
            statusAction.toolTip = !isActive ? 'Block' : 'Unblock';
            statusAction.icon = !isActive ? 'fa-user-slash' : 'fa-user-check';
            statusAction.styles = !isActive ? 'text-red-400' : 'text-green-400';
          }

          this.actionTriggeredEvent.emit({ [action]: value, userId: row.id });
        }
      });
    } else {
      // this.actionTriggeredEvent.emit({ [action]: value, userId: row.id });
    }
  }
}
