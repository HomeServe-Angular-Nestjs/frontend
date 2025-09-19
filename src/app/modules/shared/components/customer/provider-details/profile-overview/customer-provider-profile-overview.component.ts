import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProvider } from '../../../../../../core/models/user.model';
import { Subscription } from 'rxjs';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { getColorFromChar } from '../../../../../../core/utils/style.utils';
import { Store } from '@ngrx/store';
import { customerActions } from '../../../../../../store/customer/customer.actions';
import { IsSavedPipe } from '../../../../../../core/pipes/is-saved-provider.pipe';
import { ChatSocketService } from '../../../../../../core/services/socket-service/chat.service';
import { Router } from '@angular/router';
import { chatActions } from '../../../../../../store/chat/chat.action';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { ReportModalComponent } from '../../../../partials/shared/report-modal/report-modal.component';
import { IReportSubmit, ReportService } from '../../../../../../core/services/report.service';

@Component({
  selector: 'app-customer-provider-profile-overview',
  imports: [CommonModule, IsSavedPipe, ReportModalComponent],
  providers: [ReportService],
  templateUrl: './customer-provider-profile-overview.component.html',
})
export class CustomerProviderProfileOverviewComponent implements OnInit, OnDestroy {
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _providerService = inject(ProviderService);
  private readonly _chatService = inject(ChatSocketService);
  private readonly _reportService = inject(ReportService);
  private readonly _router = inject(Router);
  private readonly _store = inject(Store);

  private providerDataSub!: Subscription;

  providerData!: IProvider | null;
  fallbackChar: string = '';
  openReportModal = false;

  ngOnInit(): void {
    this.providerDataSub = this._providerService.providerData$.subscribe(data => {
      this.providerData = data;
    });
  }

  ngOnDestroy(): void {
    if (this.providerDataSub) {
      this.providerDataSub.unsubscribe();
    }
  }

  fallbackColor(text: string | undefined): string {
    if (text) {
      this.fallbackChar = text[0].toUpperCase();
      return getColorFromChar(this.fallbackChar);
    }
    return '#dbeafe';
  }

  addToSaved(providerId: string | undefined) {
    if (providerId) {
      this._store.dispatch(customerActions.updateAddToSaved({ providerId }));
    }
  }

  chat() {
    if (this.providerData && this.providerData.id) {
      this._chatService.fetchChat({ id: this.providerData.id, type: 'provider' })
        .subscribe({
          next: (response) => {
            if (response.success && response.data?.id) {
              this._store.dispatch(chatActions.selectChat({ chatId: response.data.id }));
              this._router.navigate(['chat']);
            } else {
              this._toastr.error('Unable to fetch chat.');
            }
          },
          error: (err) => {
            this._toastr.error('An error occurred while fetching chat.');
            console.error('Chat error:', err);
          }
        });
    }
  }

  getStarType(index: number, rating: number | undefined): 'full' | 'half' | 'empty' {
    if (!rating) return 'empty';
    if (index < Math.floor(rating)) return 'full';
    if (index < rating) return 'half';
    return 'empty';
  }

  reportProvider(providerId?: string) {
    if (!providerId) return;
    this.openReportModal = true;
  }

  submitReport(report: Omit<IReportSubmit, 'targetId'>) {
    if (!this.providerData?.id) {
      console.error('[ERROR] Provider ID is missing.');
      return;
    };

    const reportData = {
      ...report,
      targetId: this.providerData?.id,
    }

    this._reportService.submit(reportData).subscribe({
      next: (res) => {
        if (res.success) this._toastr.success('Report has been submitted.')
      },
      complete: () => this.openReportModal = false
    });
  }
}
