import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
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

import { authEffects } from './store/auth/auth.effects';
import { userEffects } from './store/users/user.effect';
import { providerEffects } from './store/provider/provider.effects';
import { offeredServiceEffects } from './store/offered-services/offeredServices.effects';
import { metaReducers } from './store/auth/meta.reducer';
import { scheduleEffects } from './store/schedules/schedule.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore({
      [authFeature.name]: authFeature.reducer,
      [userFeature.name]: userFeature.reducer,
      [offeredServiceFeature.name]: offeredServiceFeature.reducer,
      [providerFeature.name]: providerFeature.reducer,
      [scheduleFeature.name]: scheduleFeature.reducer,
    }, { metaReducers }),
    provideEffects(authEffects, userEffects, offeredServiceEffects, providerEffects, scheduleEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: true, autoPause: true })
  ]
};
