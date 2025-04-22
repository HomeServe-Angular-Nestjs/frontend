import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-provider-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './provider-kyc.component.html',
})
export class ProviderKycComponent {
  currentStep = 1;
  formSubmitted = false;

  steps = [
    { title: 'Personal', completed: false },
    { title: 'Identity', completed: false },
    { title: 'Address', completed: false },
    { title: 'Review', completed: false }
  ];

  countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan'];

  idDocuments = [
    { value: 'passport', label: 'Passport', icon: '/assets/icons/passport.svg' },
    { value: 'drivers_license', label: "Driver's License", icon: '/assets/icons/license.svg' },
    { value: 'national_id', label: 'National ID', icon: '/assets/icons/id-card.svg' }
  ];

  kycData = {
    // Personal Information
    firstName: '',
    lastName: '',
    dob: '',
    nationality: '',

    // Identity Verification
    idType: '',
    idNumber: '',
    idDocument: null as File | null,
    selfie: null as File | null,

    // Address Verification
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    addressProof: null as File | null,

    // Consent
    consent: false
  };

  nextStep() {
    if (this.currentStep < this.steps.length) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  handleIdUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.kycData.idDocument = file;
    }
  }

  handleSelfieUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.kycData.selfie = file;
    }
  }

  handleAddressProofUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.kycData.addressProof = file;
    }
  }

  getDocumentTypeLabel(value: string): string {
    const doc = this.idDocuments.find(item => item.value === value);
    return doc ? doc.label : '';
  }

  submitKYC() {
    // In a real app, you would send this data to your backend
    console.log('Submitting KYC data:', this.kycData);
    this.formSubmitted = true;

    // Mark all steps as completed
    this.steps.forEach(step => step.completed = true);
  }

  closeForm() {
    // In a real app, you might navigate to another page
    console.log('Closing KYC form');
  }
}
