import { HttpErrorResponse } from '@angular/common/http';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DescriptiveError } from '../constants';

export function getDescriptionFromDataRequestError(
  dataRequestError: Error | HttpErrorResponse,
): string {
  let description = dataRequestError.message;
  if (dataRequestError instanceof HttpErrorResponse) {
    description = dataRequestError.error?.errorMessage || dataRequestError.statusText;
  }

  if (!description) {
    description = dataRequestError.toString();
  }

  return description;
}

export function parseAnyError(err: any): DescriptiveError {
  let title = '';
  let details: any = '';

  if (err instanceof HttpErrorResponse) {
    // Server or connection error happened
    if (!navigator.onLine) {
      // Handle offline error
      title = $localize`No internet connection.`;
      details = err.message;
    } else if (err.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      title = $localize`Network error occurred.`;
      details = err.message;
    } else {
      // Handle Http Error (error.status === 403, 404...)
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      title = $localize`Server returned code` + ` ${err.status}.`;
      details = err.statusText || $localize`No details provided.`;
    }
  } else {
    // Handle Client Error (Angular Error, ReferenceError...)
    title = $localize`An error occured.`;
    details = err;
  }

  let detailsString = '';

  if (typeof details === 'string') {
    detailsString = details;
  } else if (details instanceof Error) {
    detailsString = details.message;
  } else {
    detailsString = JSON.stringify(details);
  }

  return {
    title,
    description: detailsString,
  };
}

export function handleAnyError(
  err: unknown,
  notificationService: NzNotificationService | undefined,
): HttpErrorResponse | Error {
  const parsedError: DescriptiveError = parseAnyError(err);

  console.error('Generic error handler', '|', parsedError.title, '|', parsedError.description);

  notificationService?.create('error', parsedError.title, parsedError.description, {
    nzDuration: 3000,
  });

  return <HttpErrorResponse | Error>err;
}
