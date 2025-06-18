import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IDocs, IExpertise, ILanguage, IProvider } from '../../../../../core/models/user.model';
import { selectProvider } from '../../../../../store/provider/provider.selector';
import { providerActions } from '../../../../../store/provider/provider.action';

@Component({
    selector: 'app-provider-profile-about',
    templateUrl: './profile-about.component.html',
    imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class ProviderProfileAboutComponent implements OnInit {
    private readonly _store = inject(Store);
    private readonly _fb = inject(FormBuilder)

    isEditingIntro = false;
    isSpecializationsModalOpen = false;
    isCertificationModalOpen = false;
    isLanguageModalOpen = false;

    newExpertise: IExpertise = { label: '', specialization: '' };

    providerBio: string = '';
    expertises: IExpertise[] = [];
    additionalSkills: Set<string> = new Set();
    docs: IDocs[] = [];
    languages: ILanguage[] = []

    expertiseForm: FormGroup = this._fb.group({
        label: ['', Validators.required],
        specialization: ['', Validators.required],
        additionalSkills: ['']
    });


    ngOnInit(): void {
        this._store.select(selectProvider).subscribe(provider => {
            console.log(provider)
            this.providerBio = provider?.bio ?? '';
            this.expertises = provider?.expertise ?? [];
            this.additionalSkills = new Set(provider?.additionalSkills);
            this.docs = provider?.docs ?? [];
            this.languages = provider?.languages ?? [];
        });
    }

    toggleIntroEdit() {
        if (this.isEditingIntro) {
            this._store.dispatch(providerActions.updateBio({
                updateData: {
                    providerBio: this.providerBio,
                }
            }));
        }
        this.isEditingIntro = !this.isEditingIntro;
    }

    openSpecializationsModal() {
        this.isSpecializationsModalOpen = true;
    }

    closeSpecializationsModal() {
        this.isSpecializationsModalOpen = false;
    }

    saveExpertise() {
        if (this.isSpecializationsModalOpen) {
            const { label, specialization, additionalSkills } = this.expertiseForm.value;

            if (additionalSkills.trim()) {
                this.additionalSkills.add(additionalSkills.trim());
            }

            this.newExpertise = { label, specialization };

            // this._store.dispatch(providerActions.updateBio({
            //     updateData: {
            //         additionalSkills: additionalSkills
            //         expertises: specialization.trim() && label.trim() ? {
            //             label,
            //             specialization
            //         } : undefined,
            //     }
            // }));
        }
    }


    deleteSpecialization(title: any) {

    }


    addAdditionalSkill() {

    }

    removeAdditionalSkill(skill: string) {
    }


    openCertificationModal() {
        this.isCertificationModalOpen = true;
    }

    closeCertificationModal() {
        this.isCertificationModalOpen = false;
    }

    handleFileInput(event: Event) {

    }

    saveCertification() {
        // Persist logic or validation goes here
        this.closeCertificationModal();
    }



    newLanguage = '';
    newProficiency = '';

    openLanguageModal() {
        this.isLanguageModalOpen = true;
    }

    closeLanguageModal() {
        this.isLanguageModalOpen = false;
    }

    addLanguage() {

    }

    removeLanguage(index: number) {
        this.languages.splice(index, 1);
    }

    saveLanguages() {
        // Apply save logic if needed
        this.closeLanguageModal();
    }

}