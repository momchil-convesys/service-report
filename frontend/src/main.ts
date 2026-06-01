/// <reference types="@angular/localize" />

import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import * as triggerRebuild from './locale/trigger-rebuild';

// create reference to the file
// which will be modified on translation file change
triggerRebuild;

if (environment.production) {
  enableProdMode();
  // window.console.log = () => {};
}

platformBrowserDynamic()
  .bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()] })
  .catch((err) => console.error(err));
