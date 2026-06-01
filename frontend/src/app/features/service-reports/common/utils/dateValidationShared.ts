import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export class DateValidationShared {
  static datetimeRangeValidator(
    entryForm: FormGroup,
    message: string,
    controlEnd: string,
    controlStart: string,
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const endValue = entryForm.get(controlEnd)?.value;
      const startValue = entryForm.get(controlStart)?.value;

      if (!endValue || !startValue) {
        return null;
      }

      return new Date(endValue).getTime() > new Date(startValue).getTime()
        ? null
        : { custom: message };
    };
  }
}
