import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { markAllControlsAsDirty } from '../../../../helpers';

export interface MonbatToggleConfirmFormValue {
  passcode: string;
}

interface FormInterface {
  usernameAutosaveHint: FormControl<string>;
  passcode: FormControl<string>;
}

@Component({
  selector: 'app-monbat-toggle-confirm-form',
  imports: [ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule, NzIconModule],
  templateUrl: './monbat-toggle-confirm-form.component.html',
  styleUrl: './monbat-toggle-confirm-form.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonbatToggleConfirmFormComponent {
  @Input({ required: true }) toggleAction!: 'enable' | 'disable';

  // NOTE: (submit) is a standard event, so we use (submitForm) to avoid collision
  @Output() submitForm = new EventEmitter<MonbatToggleConfirmFormValue>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup<FormInterface>;

  constructor() {
    this.form = new FormGroup<FormInterface>(
      {
        passcode: new FormControl('', { validators: Validators.required, nonNullable: true }),
        usernameAutosaveHint: new FormControl('Master Control Password', { nonNullable: true }),
      },
      { updateOn: 'submit' },
    );
  }

  onCancel() {
    this.cancel.next();
  }

  onSubmit() {
    this.form.updateValueAndValidity();

    markAllControlsAsDirty(Object.values(this.form.controls));

    if (!this.form.valid) {
      return;
    }

    const formValue = this.form.getRawValue();

    const result: MonbatToggleConfirmFormValue = {
      passcode: formValue.passcode,
    };

    this.submitForm.next(result);
  }
}
