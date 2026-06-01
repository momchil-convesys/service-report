import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserSettingsService } from '../../data/services/user-settings.service';
import { isSidebarOnMobile } from './helpers';

@Injectable({
  providedIn: 'root',
})
export class ResponsiveSidebarService {
  #sidebarVisible$: undefined | BehaviorSubject<boolean> = undefined;

  constructor(private userSettingsService: UserSettingsService) {
    // Note: It is too early to check if we are on mobile,
    // because the side bar is not yet initialized.
    // If on mobile, we do not want to show the side bar when a plant is selected.
    // const currentUserSettings = this.userSettingsService.getCurrentUserSettings();
    // if (!isSidebarOnMobile()) {
    //   this.#sidebarVisible$.next(currentUserSettings.sidebarVisible);
    // }
  }

  private _getSubjectInstance(): BehaviorSubject<boolean> {
    if (this.#sidebarVisible$) {
      return this.#sidebarVisible$;
    }

    let initialValue = false;
    const currentUserSettings = this.userSettingsService.getCurrentUserSettings();
    if (!isSidebarOnMobile()) {
      initialValue = currentUserSettings.sidebarVisible;
    }

    this.#sidebarVisible$ = new BehaviorSubject<boolean>(initialValue);

    return this.#sidebarVisible$;
  }

  get sidebarVisible$() {
    return this._getSubjectInstance().asObservable();
  }

  hideSideBar() {
    /**
     * This is not triggered by the user, but by other app logic,
     * so we do not need to update the user settings.
     */
    this._getSubjectInstance().next(false);
  }

  toggleSideBar() {
    const newVisible = !this._getSubjectInstance().value;
    this._getSubjectInstance().next(newVisible);

    if (!isSidebarOnMobile()) {
      this.userSettingsService.updateCurrentUserSettings({ sidebarVisible: newVisible });
    }
  }
}
