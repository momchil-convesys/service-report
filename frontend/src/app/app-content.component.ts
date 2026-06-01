import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  LOCALE_ID,
  ViewEncapsulation,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import Keycloak from 'keycloak-js';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { environment } from '../environments/environment';
import { AppInitStateService } from './app-initialize.service';
import { setUserSelectedLocaleId } from './app-locale';
import { KEYCLOAK_DISABLED } from './auth/keycloak-constants';
import { LocalAuthService } from './auth/local-auth.service';
import { AccessControlPermission } from './constants';
import { User } from './data/models';
import { UsersService } from './data/services/users.service';
import { VersionService } from './data/services/version.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-app-content',
  templateUrl: './app-content.component.html',
  styleUrls: ['./app-content.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    NzBadgeModule,
    NzTooltipModule,
    NzResultModule,
    NzButtonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
})
export class AppContentComponent {
  isCollapsed = true;
  currentUser$: Observable<User | undefined>;

  isLocalized = environment.electron === true;

  constructor(
    @Inject(LOCALE_ID) public localeId: string,
    public appInit: AppInitStateService,
    private usersService: UsersService,
    private keycloak: Keycloak,
    private localAuth: LocalAuthService,
    public versions: VersionService,
    private router: Router,
  ) {
    this.currentUser$ = usersService.currentUser$;
  }

  onToggleNavigationMenu() {
    this.isCollapsed = !this.isCollapsed;
  }

  onHideNavigationMenu() {
    this.isCollapsed = true;
  }

  getDisplayStringForUser(user: User) {
    return `${user.displayName}`;
  }

  isCurrentUserAuthorizedToAccessAlarmTriggers(): boolean {
    return this.usersService.hasCurrentUserPermission(AccessControlPermission.AlarmTriggers_Manage);
  }

  isCurrentUserAuthorizedToAccessServiceReports(): boolean {
    return this.usersService.hasCurrentUserPermissions([
      AccessControlPermission.ServiceReports_View,
      AccessControlPermission.ServiceReports_Manage,
    ]);
  }

  getUserNameFromKeycloak() {
    try {
      return this.keycloak.profile?.username;
    } catch (err) {
      return 'NOT LOGGED IN';
    }
  }

  onLogout() {
    if (KEYCLOAK_DISABLED) {
      this.localAuth.logout();
      return;
    }

    this.keycloak.logout({
      redirectUri: environment.electron ? 'http://localhost/keycloak-logout' : undefined,
    });
  }

  onRetry() {
    window.location.reload();
  }

  onLanguageChange(localeId: string): void {
    setUserSelectedLocaleId(localeId);

    if (environment.electron) {
      window.location.href = `http://localhost/language-switch/${localeId}`;
    } else {
      window.location.href = `/${localeId}/${this.router.url}`;
    }
  }
}
