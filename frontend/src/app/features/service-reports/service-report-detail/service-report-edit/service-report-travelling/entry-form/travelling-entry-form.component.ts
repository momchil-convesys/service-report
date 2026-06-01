import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
//import { DatetimeRange } from '../../common/datetime-range';
//import { EntryFormComponent, updateOnOption } from '../../common/entry-form-base.component';
//import { datetimeToDate } from '../../common/helpers';
import { DatetimeRange } from '../../../../common/datetime-range';
import { EntryFormComponent, updateOnOption } from '../../../../common/entry-form-base.component';
import { getFormGroup } from '../../../../common/helpers';
import { DateValidationShared } from '../../../../common/utils/dateValidationShared';
import { TravellingEntryFormValue } from '../models';

@Component({
  selector: 'app-travelling-entry-form',
  templateUrl: './travelling-entry-form.component.html',
  styleUrls: ['./travelling-entry-form.component.less'],
  standalone: false,
})
export class TravellingEntryFormComponent
  extends EntryFormComponent<TravellingEntryFormValue>
  implements OnInit
{
  constructor(private fb: FormBuilder) {
    super();

    const datetimeRange = new DatetimeRange(
      fb,
      updateOnOption,
      'Time of departure should be before time of arrival.',
      'Time of arrival should be later than time of departure.',
    );
    const validationMessageStart = 'Time of departure should be before time of arrival.';
    const validationMessageEnd = 'Time of arrival should be later than time of departure.';

    this.entryForm = this.fb.group(
      {
        origin: this.fb.group({
          location: ['', { validators: [Validators.required] }],
          datetime: datetimeRange.formGroupStart,
          travelTimestamp: [new Date(), { validators: [Validators.required] }],
        }),
        destination: this.fb.group({
          location: ['', { validators: [Validators.required] }],
          datetime: datetimeRange.formGroupEnd,
          travelTimestamp: [new Date(), { validators: [Validators.required] }],
        }),
        distance: ['', { validators: [Validators.required, Validators.min(1)] }],
        duration: this.fb.group({
          hours: [{ value: 0, disabled: true }],
          minutes: [{ value: 0, disabled: true }],
        }),
        vehiclesCount: [1, { validators: [Validators.required, Validators.min(1)] }],
        personsParticipated: ['', { validators: [Validators.required] }],
        otherExpenses: [''],
      },
      { updateOn: updateOnOption },
    );

    this.entryForm
      .get('origin.travelTimestamp')!
      .addValidators([
        Validators.required,
        DateValidationShared.datetimeRangeValidator(
          this.entryForm,
          validationMessageStart,
          'destination.travelTimestamp',
          'origin.travelTimestamp',
        ),
      ]);
    this.entryForm
      .get('destination.travelTimestamp')!
      .addValidators([
        Validators.required,
        DateValidationShared.datetimeRangeValidator(
          this.entryForm,
          validationMessageEnd,
          'destination.travelTimestamp',
          'origin.travelTimestamp',
        ),
      ]);

    this.setInitialValue(this.entryForm.value);
  }

  override ngOnInit(): void {
    if (this.entryForm) {
      this.entryForm
        .get('vehiclesCount')!
        .valueChanges.pipe(takeUntil(this.destroyed$))
        .subscribe((value) => {
          if (value <= 0) {
            this.entryForm.get('vehiclesCount')!.setValue(1);
          }
        });

      combineLatest([
        this.entryForm
          .get('origin.travelTimestamp')!
          .valueChanges.pipe(startWith(this.entryForm.get('origin.travelTimestamp')!.value)),
        this.entryForm
          .get('destination.travelTimestamp')!
          .valueChanges.pipe(startWith(this.entryForm.get('destination.travelTimestamp')!.value)),
      ])
        .pipe(takeUntil(this.destroyed$))
        .subscribe(([departureDatetime, arrivalDatetime]) => {
          // const departureDatetime = datetimeToDate(departureDatetimeValue);
          // const arrivalDatetime = datetimeToDate(arrivalDatetimeValue);

          const diffMinutes = (arrivalDatetime.getTime() - departureDatetime.getTime()) / 1000 / 60;

          this.entryForm.get('duration')!.setValue(
            {
              hours: Math.trunc(diffMinutes / 60),
              minutes: diffMinutes % 60,
            },
            { emitEvent: false },
          );
        });
    }
  }

  getFormGroup(entryForm: FormGroup, prop: string): FormGroup {
    return getFormGroup(entryForm, prop);
  }
  public getFormControl(entryForm: FormGroup, prop: string): FormControl {
    return entryForm.get(prop) as FormControl;
  }
}
