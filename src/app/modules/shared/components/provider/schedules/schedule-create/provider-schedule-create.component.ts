import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IProvider } from '../../../../../../core/models/user.model';
import { Store } from '@ngrx/store';
import { providerActions } from '../../../../../../store/provider/provider.action';
import { selectProvider } from '../../../../../../store/provider/provider.selector';
import { ProviderSlotCreationComponent } from "../slot-creation/provider-slot-creation.component";

@Component({
  selector: 'app-provider-schedule-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ReactiveFormsModule, ProviderSlotCreationComponent],
  templateUrl: './provider-schedule-create.component.html',
})
export class ProviderScheduleCreateComponent implements OnInit {
  private _fb = inject(FormBuilder);

  provider!: IProvider | null;
  bookingLimits = [1, 2, 3, 4, 5];
  bufferOptions = [
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '45 minutes', value: 45 },
    { label: '1 hour', value: 60 },
  ];

  scheduleForm = this._fb.group({
    bookingLimit: this._fb.control<number | null>(null),
    bufferTime: this._fb.control<number | null>(null),
    serviceArea: this._fb.control<boolean>(false)
  });

  constructor(private _store: Store) {
    this._store.select(selectProvider).subscribe(data => {
      this.provider = data;
    });
  }

  ngOnInit(): void {
    if (this.provider && this.provider.id) {
      this.scheduleForm.patchValue({
        bookingLimit: this.provider.bookingLimit,
        bufferTime: this.provider.bufferTime,
        serviceArea: this.provider.enableSR
      })
    }
  }

  saveData() {
    const data: Partial<IProvider> = {
      bookingLimit: this.scheduleForm.get('bookingLimit')?.value,
      bufferTime: this.scheduleForm.get('bufferTime')?.value,
      enableSR: this.scheduleForm.get('serviceArea')?.value ?? false
    }

    const formData = new FormData();

    formData.append('providerData', JSON.stringify(data));

    this._store.dispatch(providerActions.updateProvider({ updateProviderData: formData }));
  }
}
