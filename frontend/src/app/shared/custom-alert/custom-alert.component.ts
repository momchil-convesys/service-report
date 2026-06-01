import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { CustomError } from '../../constants';

@Component({
  selector: 'app-custom-alert',
  imports: [NzAlertModule],
  templateUrl: './custom-alert.component.html',
  styleUrl: './custom-alert.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomAlertComponent {
  @Input() customError: CustomError | null = null;
  @Input() nzBanner: boolean = false;
  @Input() nzCloseable: boolean = false;

  get errorTitle(): string {
    return this.customError?.title || $localize`Error!`;
  }

  get errorMessages(): string[] {
    if (!this.customError) {
      return [];
    }

    const anyError: HttpErrorResponse | Error | string | null = this.customError.error;

    if (!anyError) {
      return [];
    }

    if (anyError instanceof HttpErrorResponse) {
      const httpErrorResponse: HttpErrorResponse = anyError;

      if (httpErrorResponse.error?.messages) {
        if (Array.isArray(httpErrorResponse.error.messages)) {
          return httpErrorResponse.error.messages;
        }

        return [httpErrorResponse.error.messages];
      }

      if (httpErrorResponse.error?.message) {
        return [httpErrorResponse.error.message];
      }

      if (httpErrorResponse.error?.title) {
        return [httpErrorResponse.error.title];
      }

      if (httpErrorResponse.message) {
        return [httpErrorResponse.message];
      }

      return [httpErrorResponse.statusText || 'Unknown error'];
    }

    if (anyError instanceof Error) {
      return [anyError.message];
    }

    if (typeof anyError === 'string') {
      return [anyError];
    }

    return ['Unknown error'];
  }
}
