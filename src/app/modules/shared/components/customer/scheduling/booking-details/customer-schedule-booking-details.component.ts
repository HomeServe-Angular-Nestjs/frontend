import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { API_KEY } from '../../../../../../environments/api.environments';
import { MapboxMapComponent } from "../../../../partials/shared/map/map.component";
import { ISchedule, ISlot } from '../../../../../../core/models/schedules.model';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-customer-schedule-booking-details',
  standalone: true,
  imports: [CommonModule, MapboxMapComponent, FormsModule],
  templateUrl: './customer-schedule-booking-details.component.html',
})
export class CustomerScheduleBookingDetailsComponent {

  @Input({ required: true }) schedules!: ISchedule[] | null;

  mapVisible = false;
  center: [number, number] = [76.9560, 8.5010];
  zoom = 12;
  selectedAddress: string | null = null;
  selectedDate: string = '';
  slots: ISlot[] = [];

  readonly mapboxToken = API_KEY.mapbox;

  toggleMap() {
    this.mapVisible = !this.mapVisible;
  }

  handleDateChange() {
    const formattedDate = new Date(this.selectedDate).toDateString();

    this.schedules?.forEach((schedule: ISchedule) => {
      console.log(schedule)
      if (schedule.scheduleDate === formattedDate) {
        this.slots = schedule.slots;
      }
    });
  }

  async onMapLocationChanged(newCenter: [number, number]) {
    this.center = newCenter;
    const [lng, lat] = newCenter;
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.mapboxToken}`
    );
    const data = await response.json();
    this.selectedAddress = data.features[0]?.place_name || 'No address found';
  }
}
