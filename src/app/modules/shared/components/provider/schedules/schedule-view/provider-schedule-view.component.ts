import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScheduleService } from '../../../../../../core/services/schedule.service';
import { map, Observable } from 'rxjs';
import { IScheduleList } from '../../../../../../core/models/schedules.model';

@Component({
  selector: 'app-provider-schedule-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './provider-schedule-view.component.html',
})
export class ProviderScheduleViewComponent implements OnInit {
  private readonly _scheduleService = inject(ScheduleService);

  scheduleList$!: Observable<IScheduleList[]>

  ngOnInit(): void {
    this.scheduleList$ = this._scheduleService.fetchSchduleList().pipe(
      map((response) => response.data ?? [])
    )
  }


  formatMonthYear(monthString: string): Date {
    return new Date(`${monthString}-01`);
  }
}

