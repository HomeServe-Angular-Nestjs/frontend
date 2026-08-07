import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-resolution-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, FormsModule],
    templateUrl: './resolution-dialog.component.html'
})
export class ResolutionDialogComponent {
    note = '';
    isSubmitting = signal(false);

    constructor(
        public dialogRef: MatDialogRef<ResolutionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            title: string;
            message: string;
            isResolve: boolean;
        }
    ) { }

    cancel() {
        this.dialogRef.close(false);
    }

    confirm() {
        if (!this.note.trim() || this.isSubmitting()) return;
        this.isSubmitting.set(true);
        this.dialogRef.close({ note: this.note.trim() });
    }
}
