import { Component, inject, OnInit } from "@angular/core";
import { ProviderPasswordsComponent } from "../../../shared/components/provider/password-setting/password.component";
import { CommonModule } from "@angular/common";
import { SharedDataService } from "../../../../core/services/public/shared-data.service";

@Component({
    selector: 'app-provider-settings',
    templateUrl: './settings.component.html',
    imports: [CommonModule, ProviderPasswordsComponent],
})
export class ProviderSettingsComponent implements OnInit {
    private readonly _sharedService = inject(SharedDataService);

    ngOnInit(): void {
        this._sharedService.setProviderHeader('Settings');
    }
}
