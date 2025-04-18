import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authFeature } from './store/feature/auth.feature';
import { authEffects } from './store/effects/auth.effects';
import { metaReducers } from './store/reducers/meta.reducer';
import { provideAnimations } from '@angular/platform-browser/animations'
import { userFeature } from './store/feature/user.feature';
import { userEffects } from './store/effects/user.effect';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { offeredServiceFeature } from './store/feature/offeredServices.feature';
import { offeredServiceEffects } from './store/effects/offeredServices.effects';

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
    }, { metaReducers }),
    provideEffects(authEffects, userEffects, offeredServiceEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: true, autoPause: true })
  ]
};
