import { Component, inject, OnInit } from "@angular/core";
import { WalletService } from "../../../../../core/services/wallet.service";
import { IWallet } from "../../../../../core/models/wallet.model";
import { filter, map } from "rxjs";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-customer-wallet',
    templateUrl: 'customer-wallet.component.html',
    providers: [WalletService],
    imports: [CommonModule]
})
export class CustomerWalletComponent implements OnInit {
    private readonly _walletService = inject(WalletService);

    wallet!: IWallet;
    transactionHistory: any

    ngOnInit(): void {
        this._walletService.getWallet()
            .pipe(
                filter(res => !!res.success && !!res.data),
                map((res) => res.data as IWallet)
            ).subscribe(wallet => this.wallet = wallet);
    }
}