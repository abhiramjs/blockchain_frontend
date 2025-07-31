import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideZoneChangeDetection(),
    provideHttpClient()
  ]
};
