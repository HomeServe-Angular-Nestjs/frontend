import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-provider-edit-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './provider-edit-overview.component.html',
})
export class ProviderEditOverviewComponent {
  private router = inject(Router);

  profileImage: string | ArrayBuffer | null = null;
  daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  profile = {
    fullName: 'John Doe',
    profession: 'Certified Electrician',
    location: 'San Francisco, CA',
    serviceRadius: 25,
    experience: 5,
    licensed: true,
    workingDays: {
      start: 'Mon',
      end: 'Fri'
    },
    workingHours: {
      start: '08:00',
      end: '18:00'
    },
    emergencyAvailable: true,
    jobsCompleted: 250,
    satisfactionRate: 98
  };

  originalProfile: any;

  ngOnInit() {
    // Create a deep copy of the original profile for cancel functionality
    this.originalProfile = JSON.parse(JSON.stringify(this.profile));
  }

  handleImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    // Implement save logic here
    console.log('Profile saved:', this.profile);
    // In a real app, you would call a service to save the data
    this.originalProfile = JSON.parse(JSON.stringify(this.profile));
  }

  cancelEdit() {
    this.router.navigate(['provider', 'profiles'])
  }
}
