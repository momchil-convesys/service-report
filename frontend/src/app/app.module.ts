import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ErrorHandler, LOCALE_ID, NgModule, inject, provideAppInitializer } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import {
  FileAddOutline,
  FullscreenOutline,
  MenuUnfoldOutline,
  UserOutline,
  WarningFill,
} from '@ant-design/icons-angular/icons';
import {
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  includeBearerTokenInterceptor,
} from 'keycloak-angular';
import { provideNzConfig } from 'ng-zorro-antd/core/config';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { NZ_DATE_CONFIG, NZ_I18N, bg_BG, en_GB } from 'ng-zorro-antd/i18n';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { initializeApp } from './app-initialize';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideKeycloakAngular } from './auth/keycloak-global-config';
import { KEYCLOAK_DISABLED } from './auth/keycloak-constants';
import { localAuthInterceptor } from './auth/local-auth.interceptor';
import { LoadChunkErrorHandler } from './data/services/load-chunk-error-handler';
import { ngZorroConfig } from './ng-zorro-global-config';
import { CustomRouteReuseStrategy } from './route-reuse-strategy';

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, BrowserAnimationsModule, NzModalModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy },
    {
      provide: NZ_ICONS,
      useValue: [FileAddOutline, FullscreenOutline, MenuUnfoldOutline, UserOutline, WarningFill],
    },
    provideNzConfig(ngZorroConfig),
    {
      provide: NZ_I18N,
      useFactory: () => {
        const localeId = inject(LOCALE_ID);

        switch (localeId) {
          case 'en-GB':
            return en_GB;
          case 'bg':
            return bg_BG;
          default:
            return en_GB;
        }
      },
    },
    {
      provide: NZ_DATE_CONFIG,
      useValue: {
        firstDayOfWeek: 1, // week starts on Monday (Sunday is 0)
      },
    },
    provideKeycloakAngular(),
    provideHttpClient(
      withInterceptors(
        KEYCLOAK_DISABLED ? [localAuthInterceptor] : [localAuthInterceptor, includeBearerTokenInterceptor],
      ),
    ),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [
        {
          urlPattern: /^(?:(?!app-version\.json$).)*$/,
        },
      ],
    },
    provideAppInitializer(() => initializeApp()),
    {
      provide: ErrorHandler,
      useClass: LoadChunkErrorHandler,
    },
  ],
})
export class AppModule {}
