import { Component, Input, OnChanges, Output, SimpleChanges, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TableAction, TableData, UserTableRow } from '../../../../../../../core/models/table.model';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog-box/confirm-dialog.component';

@Component({
  selector: 'app-admin-table',
  templateUrl: './table.component.html',
  imports: [CommonModule],
})
export class AdminTableComponent implements OnChanges {
  private _dialog = inject(MatDialog);

  @Input({ required: true }) tableData!: TableData<UserTableRow>;
  @Output() actionTriggeredEvent = new EventEmitter<any>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableData'] && this.tableData) {
      // console.log('Table data updated:', this.tableData);
    }
  }

  emitAction(action: string | boolean, row: UserTableRow) {
    if (action === 'status') {
      this._confirmStatusChange(row);
    } else if (action === 'delete') {
      this._confirmDeletion(row);
    } else {
      // Emit other actions (like 'view', 'edit', etc.) to the parent
      this.actionTriggeredEvent.emit({ action, userId: row.id, row });
    }
  }

  refreshPage() {
    window.location.reload();
  }

  private _confirmStatusChange(row: UserTableRow) {
    const isActive = row.status === 'Active';
    const nextStatus = isActive ? 'Block' : 'Unblock';

    this._openConfirmationDialog(`Are you sure you want to ${nextStatus.toLowerCase()} ${row.username}?`, 'Confirm Action')
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;

        // Update row status locally for immediate feedback
        const newIsActive = !isActive;
        row.status = newIsActive ? 'Active' : 'Blocked';

        // Update action button appearance
        this._updateActionButton(row, 'status', {
          value: newIsActive,
          toolTip: newIsActive ? 'Block' : 'Unblock',
          icon: newIsActive ? 'fas fa-user-slash' : 'fas fa-user-check',
          styles: newIsActive ? 'text-red-400' : 'text-green-400'
        });

        this.actionTriggeredEvent.emit({ action: 'status', status: isActive, userId: row.id });
      });
  }

  private _confirmDeletion(row: UserTableRow) {
    this._openConfirmationDialog(`Are you sure you want to remove ${row.username}?`, 'Confirm Deletion')
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.actionTriggeredEvent.emit({ action: 'delete', userId: row.id });
      });
  }

  private _openConfirmationDialog(message: string, title: string) {
    return this._dialog.open(ConfirmDialogComponent, {
      data: { title, message },
      width: '400px'
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
