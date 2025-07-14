import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouterConfigOptions, withInMemoryScrolling, withRouterConfig, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideAnimations } from '@angular/platform-browser/animations'
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { authFeature } from './store/auth/auth.feature';
import { userFeature } from './store/users/user.feature';
import { offeredServiceFeature } from './store/offered-services/offeredServices.feature';
import { providerFeature } from './store/provider/provider.feature';
import { scheduleFeature } from './store/schedules/schedule.feature';
import { customerFeature } from './store/customer/customer.feature';
import { subscriptionFeature } from './store/subscriptions/subscription.features';
import { chatFeature } from './store/chat/chat.feature';

import { authEffects } from './store/auth/auth.effects';
import { userEffects } from './store/users/user.effect';
import { providerEffects } from './store/provider/provider.effects';
import { offeredServiceEffects } from './store/offered-services/offeredServices.effects';
import { scheduleEffects } from './store/schedules/schedule.effects';
import { customerEffects } from './store/customer/customer.effects';
import { ToastrModule } from 'ngx-toastr';
import { chatEffects } from './store/chat/chats.effect';
import { metaReducers } from './store/auth/meta.reducer';
import { subscriptionEffects } from './store/subscriptions/subscription.effects';


export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    importProvidersFrom(ToastrModule.forRoot({
      positionClass: 'toast-top-center',
      timeOut: 3000,
      progressBar: true,
      closeButton: true
    })),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes,
      withViewTransitions(), // optional
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      })
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore({
      [authFeature.name]: authFeature.reducer,
      [userFeature.name]: userFeature.reducer,
      [offeredServiceFeature.name]: offeredServiceFeature.reducer,
      [providerFeature.name]: providerFeature.reducer,
      [scheduleFeature.name]: scheduleFeature.reducer,
      [customerFeature.name]: customerFeature.reducer,
      [chatFeature.name]: chatFeature.reducer,
      [subscriptionFeature.name]: subscriptionFeature.reducer,

    }, { metaReducers }),
    provideEffects(
      offeredServiceEffects,
      subscriptionEffects,
      scheduleEffects,
      customerEffects,
      providerEffects,
      authEffects,
      userEffects,
      chatEffects,
    ),
    provideStoreDevtools({ maxAge: 25, logOnly: true, autoPause: true }),
  ]
};
