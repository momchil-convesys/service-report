import { FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { dateToDateTime, datetimeToDate } from './helpers';
import { Datetime } from './models';

const now: Datetime = dateToDateTime(new Date());

export class DatetimeRange {
  formGroupStart: FormGroup;
  formGroupEnd: FormGroup;

  constructor(
    fb: FormBuilder,
    updateOn: string,
    validationMessageStart: string,
    validationMessageEnd: string,
  ) {
    this.formGroupStart = fb.group({ date: [now.date], time: [now.time] }, { updateOn });
    this.formGroupEnd = fb.group({ date: [now.date], time: [now.time] }, { updateOn });
    // this.formGroupStart = fb.group({ date: [now.date], time: [now.time] }, undefined);
    // this.formGroupEnd = fb.group({ date: [now.date], time: [now.time] }, undefined);

    // this.formGroupStart.setValidators((control: FormGroup) =>
    //   this.datetimeRangeValidator(control, validationMessageStart)
    // );

    // this.formGroupEnd.setValidators((control: FormGroup) =>
    //   this.datetimeRangeValidator(control, validationMessageEnd)
    // );
  }

  private datetimeRangeValidator(targetGroup: FormGroup, message: string): ValidationErrors | null {
    if (datetimeToDate(this.formGroupEnd.value) > datetimeToDate(this.formGroupStart.value)) {
      DatetimeRange.clearErrorsOnDatetimeGroup(this.formGroupStart);
      DatetimeRange.clearErrorsOnDatetimeGroup(this.formGroupEnd);

      return null;
    }

    DatetimeRange.invalidateDatetimeGroup(targetGroup);

    return { custom: message };
  }

  static invalidateDatetimeGroup(formGroup: FormGroup) {
    if (formGroup.controls['date'].dirty) {
      formGroup.controls['time'].markAsDirty();
    } else if (formGroup.controls['time'].dirty) {
      formGroup.controls['date'].markAsDirty();
    }

    formGroup.controls['date'].setErrors({ invalid: true });
    formGroup.controls['time'].setErrors({ invalid: true });
  }

  static clearErrorsOnDatetimeGroup(formGroup: FormGroup) {
    formGroup.controls['date'].setErrors(null);
    formGroup.controls['time'].setErrors(null);
    formGroup.setErrors(null);
  }
}
