import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { EntryFormComponent, updateOnOption } from '../../../../common/entry-form-base.component';
import { getFormGroup } from '../../../../common/helpers';
import { DateValidationShared } from '../../../../common/utils/dateValidationShared';
import { WorkEntryFormValue } from '../models';

@Component({
  selector: 'app-work-entry-form',
  templateUrl: './work-entry-form.component.html',
  styleUrls: ['./work-entry-form.component.less'],
  standalone: false,
})
export class WorkEntryFormComponent
  extends EntryFormComponent<WorkEntryFormValue>
  implements OnInit
{
  format = 'dd/MM/yyyy HH:mm';
  constructor(private fb: FormBuilder) {
    super();

    const validationMessageStart = 'Time of start work should be before time of end work.';
    const validationMessageEnd = 'Time of end work should be later than time of start work.';
    this.entryForm = this.fb.group(
      {
        workName: ['', { validators: [Validators.required] }],
        personsWorkParticipated: ['', { validators: [Validators.required] }],
        // timeWorkStart: this.fb.group({
        //   datetime: datetimeRange.formGroupStart,
        // }),

        timeWorkStartTimestamp: [new Date(), { validators: [Validators.required] }],
        timeWorkEndTimestamp: [new Date(), { validators: [Validators.required] }],
        // timeWorkEnd: this.fb.group({
        //   datetime: datetimeRange.formGroupEnd,
        // }),
      },
      { updateOn: updateOnOption },
    );
    this.entryForm
      .get('timeWorkStartTimestamp')!
      .addValidators([
        Validators.required,
        DateValidationShared.datetimeRangeValidator(
          this.entryForm,
          validationMessageStart,
          'timeWorkEndTimestamp',
          'timeWorkStartTimestamp',
        ),
      ]);
    this.entryForm
      .get('timeWorkEndTimestamp')!
      .addValidators([
        Validators.required,
        DateValidationShared.datetimeRangeValidator(
          this.entryForm,
          validationMessageEnd,
          'timeWorkEndTimestamp',
          'timeWorkStartTimestamp',
        ),
      ]);
    this.syncDateRangeValidation();
    this.setInitialValue(this.entryForm.value);
  }

  public getFormGroup(entryForm: FormGroup, prop: string): FormGroup {
    return getFormGroup(entryForm, prop);
  }
  public getFormControl(entryForm: FormGroup, prop: string): FormControl {
    return entryForm.get(prop) as FormControl;
  }

  private syncDateRangeValidation(): void {
    const startControl = this.entryForm.get('timeWorkStartTimestamp')!;
    const endControl = this.entryForm.get('timeWorkEndTimestamp')!;

    startControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      endControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    endControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      startControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    startControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    endControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }
}
