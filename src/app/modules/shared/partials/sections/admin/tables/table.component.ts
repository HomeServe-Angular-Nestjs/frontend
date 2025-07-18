import { Component, Input, OnChanges, Output, SimpleChanges, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TableAction, TableData, UserTableRow } from '../../../../../../core/models/table.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog-box/confirm-dialog.component';
import { FilterDeletedUserPipe } from '../../../../../../core/pipes/filter-blocked-user.pipe';

@Component({
  selector: 'app-table',
  standalone: true,
  templateUrl: './table.component.html',
  imports: [CommonModule, FilterDeletedUserPipe],
})
export class TableComponent implements OnChanges {
  private _dialog = inject(MatDialog);

  @Input({ required: true }) tableData!: TableData<UserTableRow>;
  @Output() actionTriggeredEvent = new EventEmitter()

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableData']) {
    }
  }

  emitAction(action: string | boolean, row: UserTableRow) {
    if (action === 'status') {
      this._confirmStatusChange(row)
    } else if (action === 'delete') {
      this._confirmDeletion(row);
    }
  }

  private _confirmStatusChange(row: UserTableRow) {
    const isActive = row.status === 'Active';
    const nextStatus = isActive ? 'Block' : 'Unblock';

    this._openConfirmationDialog(`Are you sure you want to ${nextStatus.toLowerCase()} ${row.username}?`, 'Confirm Action')
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;

        // Update row status
        row.status = isActive ? 'Blocked' : 'Active';

        // Update action button appearance
        this._updateActionButton(row, 'status', {
          value: !isActive,
          toolTip: !isActive ? 'Block' : 'Unblock',
          icon: !isActive ? 'fa-user-slash' : 'fa-user-check',
          styles: !isActive ? 'text-red-400' : 'text-green-400'
        });
        
        this.actionTriggeredEvent.emit({ action: 'status', status: isActive, userId: row.id });
      });
  }

  private _confirmDeletion(row: UserTableRow) {
    this._openConfirmationDialog(`Are you sure you want to remove ${row.username}?`, 'Confirm Action')
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.actionTriggeredEvent.emit({ action: 'delete', userId: row.id });
      })
  }


  private _openConfirmationDialog(message: string, title: string) {
    return this._dialog.open(ConfirmDialogComponent, {
      data: { title, message },
    });
  }

  private _updateActionButton(
    row: UserTableRow,
    actionName: string,
    update: Partial<TableAction>) {
    const action = row.actions.find(a => a.action === actionName);
    if (!action) return;
    Object.assign(action, update);
  }
}
