import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { switchMap, timer } from 'rxjs';
import { ONE_MINUTE } from '../../constants';

const checkForUpdatesInterval = ONE_MINUTE;
interface AppVersionData {
  version: string;
  buildDate: string;
  commitHash: string;
}

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  // Save version on first fetch, then compare against
  initialAppVersionData: AppVersionData | undefined;
  modalRef: NzModalRef | undefined;

  constructor(
    private http: HttpClient,
    private modal: NzModalService,
  ) {
    timer(0, checkForUpdatesInterval)
      .pipe(
        switchMap(() =>
          this.http.get<AppVersionData>('app-version.json', {
            headers: new HttpHeaders({
              'Cache-Control': 'no-cache',
              'Content-Type': 'application/json',
            }),
          }),
        ),
      )
      .subscribe((appVersionData) => {
        if (!this.initialAppVersionData) {
          // console.log('Current app version: ', appVersionData);
          this.initialAppVersionData = appVersionData;
        } else {
          if (this.modalRef) {
            // A modal propmpt is already presented to the user
            return;
          }

          const loaded_AppVersionData: AppVersionData = this.initialAppVersionData;
          const server_AppVersionData: AppVersionData = appVersionData;

          if (
            loaded_AppVersionData.commitHash !== server_AppVersionData.commitHash ||
            loaded_AppVersionData.buildDate !== server_AppVersionData.buildDate
          ) {
            console.warn(
              'A different version of the app was found on server!',
              'Loaded app:',
              loaded_AppVersionData,
              'Server app:',
              server_AppVersionData,
            );

            const newVersionTitle = $localize`New version available`;
            const newVersionMessageParagraphs = [
              $localize`A new version of the application is available. Please reload the page to get the latest update.`,
              $localize`Continuing without reload may lead to unpredicted application behaviour.`,
            ];

            const modalTitle = `<h3>${newVersionTitle}</h3>`;
            const paragraphs = newVersionMessageParagraphs.map((p) => `<p>${p}</p>`).join('');
            const currentVersionLabel = $localize`Current version build timestamp`;
            const newVersionLabel = $localize`New version build timestamp`;

            this.modalRef = this.modal.info({
              nzTitle: modalTitle,
              nzContent: `${paragraphs}
                <p class="secondary-text">
                  ${currentVersionLabel}:<br>
                  ${loaded_AppVersionData.buildDate}<br>
                  ${newVersionLabel}:<br>
                  ${server_AppVersionData.buildDate}
                </p>`,
              nzOkText: $localize`Reload page`,
              nzCancelText: $localize`Cancel`,
              nzOnOk: () => window.location.reload(),
            });
          }
        }
      });
  }

  getVersion(): string {
    const versionLabel = $localize`Version`;
    const buildTimestampLabel = $localize`build timestamp`;

    return `${versionLabel} ${this.initialAppVersionData?.commitHash}${
      this.initialAppVersionData
        ? `, ${buildTimestampLabel}: ${new Date(this.initialAppVersionData?.buildDate)}`
        : ''
    }`;
  }
}
