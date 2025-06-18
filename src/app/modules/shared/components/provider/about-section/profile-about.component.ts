import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-provider-profile-about',
    templateUrl: './profile-about.component.html',
    imports: [CommonModule, FormsModule]
})
export class ProviderProfileAboutComponent {
    isEditingIntro = false;

    professionalIntro: string = `With over 5 years of experience in professional cleaning services, I specialize in residential and
commercial cleaning solutions. My approach combines traditional cleaning methods with modern, eco-friendly techniques
to deliver exceptional results.`;

    toggleIntroEdit() {
        this.isEditingIntro = !this.isEditingIntro;

        // Optional: Save logic here when switching from edit to view
        if (!this.isEditingIntro) {
            console.log('Saved intro:', this.professionalIntro);
        }
    }

    isSpecializationsModalOpen = false;

    openSpecializationsModal() {
        this.isSpecializationsModalOpen = true;
    }

    closeSpecializationsModal() {
        this.isSpecializationsModalOpen = false;
    }

    // You can later call this to update your data
    saveSpecializations() {
        // Save logic here
        this.closeSpecializationsModal();
    }

    specializations = [
        {
            title: 'Deep Cleaning',
            description: 'Residential & Commercial',
            featured: true
        },
        {
            title: 'Eco-Friendly Cleaning',
            description: 'Green Certified Products',
            featured: false
        }
    ];

    deleteSpecialization(title: string) {
        this.specializations = this.specializations.filter(
            s => s.title !== title
        );
    }

    specializationInput: string = '';
    skillTagsInput: string = '';
    additionalSkillInput: string = '';
    additionalSkills: string[] = ['Carpet Cleaning', 'Window Washing', 'Sanitization', 'Floor Maintenance'];

    addAdditionalSkill() {
        const skill = this.additionalSkillInput.trim();
        if (skill && !this.additionalSkills.includes(skill)) {
            this.additionalSkills.push(skill);
            this.additionalSkillInput = '';
        }
    }

    removeAdditionalSkill(skill: string) {
        this.additionalSkills = this.additionalSkills.filter(s => s !== skill);
    }

    isCertificationModalOpen = false;
    certificationTitle = '';
    certificateImage: string | null = null;

    openCertificationModal() {
        this.isCertificationModalOpen = true;
    }

    closeCertificationModal() {
        this.isCertificationModalOpen = false;
    }

    handleFileInput(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                this.certificateImage = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    saveCertification() {
        // Persist logic or validation goes here
        this.closeCertificationModal();
    }

    isLanguageModalOpen = false;
    languages = [
        { name: 'English', level: 'Native' },
        { name: 'Spanish', level: 'Conversational' }
    ];

    newLanguage = '';
    newProficiency = '';

    openLanguageModal() {
        this.isLanguageModalOpen = true;
    }

    closeLanguageModal() {
        this.isLanguageModalOpen = false;
    }

    addLanguage() {
        if (this.newLanguage && this.newProficiency) {
            this.languages.push({ name: this.newLanguage, level: this.newProficiency });
            this.newLanguage = '';
            this.newProficiency = '';
        }
    }

    removeLanguage(index: number) {
        this.languages.splice(index, 1);
    }

    saveLanguages() {
        // Apply save logic if needed
        this.closeLanguageModal();
    }

}