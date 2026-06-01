import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Injectable()
export class LoadChunkErrorHandler implements ErrorHandler {
  private modalRef: NzModalRef | undefined;

  constructor(private readonly injector: Injector) {}

  handleError(error: any): void {
    console.warn('LoadChunkErrorHandler: ', error);

    const chunkFailedMessage = /Loading chunk [\d]+ failed/;
    const moduleLoadFailedMessage = /Failed to fetch dynamically imported module/;
    if (chunkFailedMessage.test(error.message) || moduleLoadFailedMessage.test(error.message)) {
      console.error('LoadChunkErrorHandler: handled error', error);
      this.openNewVersionBanner();
    } else {
      // Rethrow the error if we haven't handled it
      throw error;
    }
  }

  openNewVersionBanner(): void {
    if (this.modalRef) {
      return;
    }

    const modalService = this.injector.get(NzModalService);

    const newVersionTitle = $localize`New version available`;
    const newVersionMessageParagraphs = [
      $localize`A new version of the application is available. Please reload the page to get the latest update.`,
      $localize`Continuing without reload may lead to unpredicted application behaviour.`,
    ];

    const modalTitle = `<h3>${newVersionTitle}</h3>`;
    const modalContent = newVersionMessageParagraphs.map((p) => `<p>${p}</p>`).join('');

    this.modalRef = modalService.info({
      nzTitle: modalTitle,
      nzContent: modalContent,
      nzOkText: $localize`Reload page`,
      nzCancelText: $localize`Cancel`,
      nzOnOk: () => window.location.reload(),
    });
  }
}
