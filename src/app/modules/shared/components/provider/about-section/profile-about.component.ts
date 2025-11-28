import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { IDocs, IExpertise, ILanguage } from '../../../../../core/models/user.model';
import { selectProvider } from '../../../../../store/provider/provider.selector';
import { providerActions } from '../../../../../store/provider/provider.action';
import { getValidationMessage } from '../../../../../core/utils/form-validation.utils';
import { ToastNotificationService } from '../../../../../core/services/public/toastr.service';
import { Language } from '../../../../../core/enums/enums';
import { ProviderService } from '../../../../../core/services/provider.service';

@Component({
    selector: 'app-provider-profile-about',
    templateUrl: './profile-about.component.html',
    imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class ProviderProfileAboutComponent implements OnInit {
    private readonly _store = inject(Store);
    private readonly _fb = inject(FormBuilder);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _providerService = inject(ProviderService);

    isEditingBio = false;
    isSpecializationsModalOpen = false;
    isCertificationModalOpen = false;
    isLanguageModalOpen = false;

    providerBio: string = '';
    expertise: IExpertise[] = [];
    additionalSkills: Set<string> = new Set();
    docs: IDocs[] = [];
    languages: ILanguage[] = [];

    expertiseForm: FormGroup = this._fb.group({
        specialization: ['', Validators.required],
        label: ['', Validators.required],
    });

    newAdditioanlSkill: string = '';

    certificateForm: FormGroup = this._fb.group({
        label: ['', Validators.required],
        image: ['', Validators.required]
    });

    isCertificateLoading = false;
    certificatePreview = '';

    languageForm: FormGroup = this._fb.group({
        language: ['', Validators.required],
        proficiency: ['', Validators.required]
    });

    langaugeOptions: { value: Language, label: string }[] = [
        { value: Language.NATIVE, label: 'Native' },
        { value: Language.FLUENT, label: 'Fluent' },
        { value: Language.CONVERSATIONAL, label: 'Conversational' },
        { value: Language.BASIC, label: 'Basic' },
    ];

    newLanguage: ILanguage = { language: '', proficiency: '' };

    ngOnInit(): void {
        this._store.select(selectProvider).subscribe(provider => {
            this.providerBio = provider?.bio ?? '';
            this.expertise = [...(provider?.expertise ?? [])];
            this.additionalSkills = new Set(provider?.additionalSkills ?? []);
            this.docs = [...(provider?.docs ?? [])];
            this.languages = [...(provider?.languages ?? [])];
        });
    }

    toggleBioEdit() {
        if (this.isEditingBio && this.providerBio.trim()) {
            this._store.dispatch(providerActions.updateBio({
                updateData: {
                    providerBio: this.providerBio.trim(),
                    expertise: this.expertise,
                    additionalSkills: [...this.additionalSkills],
                    languages: this.languages
                }
            }));
        }
        this.isEditingBio = !this.isEditingBio;
    }

    openExpertiseModal() {
        this.isSpecializationsModalOpen = true;
    }

    closeExpertiseModal() {
        this.expertiseForm.reset();
        this.isSpecializationsModalOpen = false;
    }

    saveExpertise() {
        if (!this.isSpecializationsModalOpen) return;

        if (this.expertiseForm.valid) {
            const { label, specialization } = this.expertiseForm.value;

            const newExpertise: IExpertise = {
                label: label.trim(),
                specialization: specialization.trim()
            };

            const exists = this.expertise.some(e =>
                e.label.toLowerCase() === newExpertise.label.toLowerCase() &&
                e.specialization.toLowerCase() === newExpertise.specialization.toLowerCase()
            );

            if (exists) {
                this._toastr.error('This expertise already exists.');
                return;
            }

            this.expertise = [...this.expertise, newExpertise];

            this._store.dispatch(providerActions.updateBio({
                updateData: {
                    expertise: this.expertise,
                    providerBio: this.providerBio.trim(),
                    additionalSkills: [...this.additionalSkills],
                    languages: this.languages
                }
            }));

            this.closeExpertiseModal();
        } else {
            this.expertiseForm.markAllAsTouched();
            const controls = {
                specialization: this.expertiseForm.get('specialization'),
                label: this.expertiseForm.get('label'),
            };

            for (const [key, control] of Object.entries(controls)) {
                const message = getValidationMessage(control, key);
                if (message) {
                    this._toastr.error(message);
                    return;
                }
            }
        }
    }

    deleteSpecialization(index: number) {
        this.expertise.splice(index, 1);
        this._store.dispatch(providerActions.updateBio({
            updateData: {
                expertise: this.expertise,
                providerBio: this.providerBio.trim(),
                additionalSkills: [...this.additionalSkills],
                languages: this.languages
            }
        }));
    }

    addAdditionalSkill() {
        if (this.newAdditioanlSkill) {
            this.additionalSkills.add(this.newAdditioanlSkill);

            this._store.dispatch(providerActions.updateBio({
                updateData: {
                    additionalSkills: Array.from(this.additionalSkills).filter(skill => typeof skill === 'string'),
                    expertise: this.expertise,
                    providerBio: this.providerBio.trim(),
                    languages: this.languages
                }
            }));
            this.newAdditioanlSkill = '';
        }
    }

    removeAdditionalSkill(skill: string) {
        this.additionalSkills.delete(skill);
        this._store.dispatch(providerActions.updateBio({
            updateData: {
                additionalSkills: [...this.additionalSkills],
                expertise: this.expertise,
                providerBio: this.providerBio.trim(),
                languages: this.languages
            }
        }));
    }

    openCertificationModal() {
        this.isCertificationModalOpen = true;
    }

    closeCertificationModal() {
        this.certificatePreview = '';
        this.certificateForm.reset();
        this.isCertificationModalOpen = false;
    }

    handleFileInput(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] || null;

        if (!file) {
            this._toastr.error('Error file');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            this._toastr.error('Only PNG, JPG or JPEG format is allowed.');
            return;
        }

        const maxSizeInBytes = 2 * 1024 * 1024;
        if (file.size > maxSizeInBytes) {
            this._toastr.error('File size should not exceed 2MB.');
            return;
        }

        this.certificateForm.patchValue({ image: file });

        const reader = new FileReader();
        reader.onload = (e) => {
            this.certificatePreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }

    saveCertification() {
        if (this.certificateForm.valid) {
            this.isCertificateLoading = true;
            const { label, image } = this.certificateForm.value;

            const formData = new FormData();
            formData.append('label', label);
            formData.append('doc', image);

            this._providerService.uploadCertificate(formData).subscribe({
                next: (response) => {
                    if (!response.success || !response.data) {
                        this._toastr.error('failed to upload');
                        return;
                    }
                    this.docs = response.data.docs;
                    this._toastr.success(response.message);
                    providerActions.successAction({ provider: response.data });
                },
                error: (err) => {
                    this._toastr.error('failed to upload');
                },
                complete: () => {
                    this.isCertificateLoading = false;
                    this.closeCertificationModal();
                }
            })
        } else {
            this.certificateForm.markAllAsTouched();
            const controls = {
                lablel: this.certificateForm.get('label'),
                image: this.certificateForm.get('image')
            }

            for (const [key, control] of Object.entries(controls)) {
                const message = getValidationMessage(control, key);
                if (message) {
                    this._toastr.error(message);
                    return;
                }
            }
        }
    }

    // TODO - approved by the admin.
    removeCertificate() { }


    openLanguageModal() {
        this.isLanguageModalOpen = true;
    }

    closeLanguageModal() {
        this.languageForm.reset();
        this.isLanguageModalOpen = false;
    }

    addLanguage() {
        if (this.languageForm.valid) {
            const { language, proficiency } = this.languageForm.value;

            for (let lang of this.languages) {
                if (lang.language.toLowerCase() === language.toLowerCase()) {
                    this._toastr.error(`You already speak ${lang.language}`);
                    return;
                }
            }

            this.languages = [...this.languages, { language, proficiency }];
            this._store.dispatch(providerActions.updateBio({
                updateData: {
                    languages: this.languages,
                    expertise: this.expertise,
                    additionalSkills: [...this.additionalSkills],
                    providerBio: this.providerBio.trim()
                }
            }));

            this.closeLanguageModal();
        } else {
            this.languageForm.markAllAsTouched();
            const controls = {
                language: this.languageForm.get('language'),
                proficiency: this.languageForm.get('proficiency')
            };

            for (const [key, control] of Object.entries(controls)) {
                const message = getValidationMessage(control, key);
                if (message) {
                    this._toastr.error(message);
                    return;
                }
            }
        }
    }

    removeLanguage(index: number) {
        this.languages.splice(index, 1);
        this._store.dispatch(providerActions.updateBio({
            updateData: {
                languages: this.languages,
                expertise: this.expertise,
                additionalSkills: [...this.additionalSkills],
                providerBio: this.providerBio.trim()
            }
        }));
    }


}
