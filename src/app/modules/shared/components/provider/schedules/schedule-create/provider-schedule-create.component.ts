import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProviderScheduleCalenderComponent } from "../../../../partials/sections/provider/schedule-calender/provider-schedule-calender.component";
import { Store } from '@ngrx/store';
import { scheduleActions } from '../../../../../../store/schedules/schedule.action';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-provider-schedule-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ProviderScheduleCalenderComponent, RouterLink],
  templateUrl: './provider-schedule-create.component.html',
})
export class ProviderScheduleCreateComponent {
  
  constructor(private store: Store) {
    // this.store.dispatch(scheduleActions.fetchSchedules({}));
  }
}
