import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authFeature } from './store/auth/auth.feature';
import { authEffects } from './store/auth/auth.effects';
import { metaReducers } from './store/auth/meta.reducer';
import { provideAnimations } from '@angular/platform-browser/animations'
import { userFeature } from './store/users/user.feature';
import { userEffects } from './store/users/user.effect';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { offeredServiceFeature } from './store/offered-services/offeredServices.feature';
import { offeredServiceEffects } from './store/offered-services/offeredServices.effects';
import { providerFeature } from './store/provider/provider.feature';
import { providerEffects } from './store/provider/provider.effects';

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
      [providerFeature.name]: providerFeature.reducer
    }, { metaReducers }),
    provideEffects(authEffects, userEffects, offeredServiceEffects, providerEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: true, autoPause: true })
  ]
};
