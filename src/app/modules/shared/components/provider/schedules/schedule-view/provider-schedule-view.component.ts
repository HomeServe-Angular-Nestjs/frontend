import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { ScheduleService } from '../../../../../../core/services/schedule.service';
import { scheduleActions } from '../../../../../../store/schedules/schedule.action';

@Component({
  selector: 'app-provider-schedule-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './provider-schedule-view.component.html',
})
export class ProviderScheduleViewComponent {
  private scheduleService = inject(ScheduleService);

  constructor(private store: Store) {
    // this.store.dispatch(scheduleActions.fetchSchedules({}));
  }
  newSchedule() { }
}

