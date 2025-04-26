import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScheduleService } from '../../../../../../core/services/schedule.service';

@Component({
  selector: 'app-provider-schedule-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './provider-schedule-view.component.html',
})
export class ProviderScheduleViewComponent {
  private scheduleService = inject(ScheduleService);

}
