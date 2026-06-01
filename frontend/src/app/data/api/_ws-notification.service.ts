import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root',
})
export class WebSocketNotificationService {
  private currentMessageId: string | undefined;

  constructor(private message: NzMessageService) {}

  showSocketWarning() {
    if (this.currentMessageId) {
      return;
    }

    this.currentMessageId = this.message.warning(
      $localize`Web sockets connection problem! Trying to reconnect... `,
      {
        nzDuration: 0,
      },
    ).messageId;
  }

  showSocketError() {
    this.removeCurrentNotification();

    this.currentMessageId = this.message.error(
      $localize`There was a connection problem. Please reload the page! `,
      {
        nzDuration: 0,
      },
    ).messageId;
  }

  hideSocketNotifications() {
    this.removeCurrentNotification();
  }

  private removeCurrentNotification() {
    if (this.currentMessageId) {
      this.message.remove(this.currentMessageId);
      this.currentMessageId = undefined;
    }
  }
}
