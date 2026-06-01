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
import { markAllControlsAsDirty } from '../../../helpers';
import { SystemSetupType } from '../constants';
import { SystemSetupIconComponent } from '../system-setup-icon/system-setup-icon.component';
import { SystemSetupTagComponent } from '../system-setup-tag/system-setup-tag.component';

export interface SystemControlToggleConfirmFormValue {
  passcode: string;
}

interface FormInterface {
  usernameAutosaveHint: FormControl<string>;
  passcode: FormControl<string>;
}

@Component({
  selector: 'app-system-control-toggle-confirm-form',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    SystemSetupTagComponent,
    SystemSetupIconComponent,
  ],
  templateUrl: './system-control-toggle-confirm-form.component.html',
  styleUrl: './system-control-toggle-confirm-form.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemControlToggleConfirmFormComponent {
  @Input({ required: true }) toggleAction!: 'take' | 'release';
  @Input({ required: true }) thisSetup!: SystemSetupType;
  @Input({ required: true }) setupInControl!: SystemSetupType;

  // NOTE: (submit) is a standard event, so we use (submitForm) to avoid collision
  @Output() submitForm = new EventEmitter<SystemControlToggleConfirmFormValue>();
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

    const result: SystemControlToggleConfirmFormValue = {
      passcode: formValue.passcode,
    };

    this.submitForm.next(result);
  }

  otherSetupType(setupType: SystemSetupType): SystemSetupType {
    return setupType === 'cloud' ? 'on-site' : 'cloud';
  }
}
