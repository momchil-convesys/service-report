import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { TypedChange } from '../../../constants';
import {
  GridExportSchedule_CurrentSettings_DTO,
  GridExportSchedule_UpdateSettings_DTO,
} from '../_data/models/grid-export-schedule-settings.dto';

interface SettingsForm {
  minExportPrice: FormControl<number>;
  autoEnableSchedules: FormControl<boolean>;
}

interface ComponentChanges extends SimpleChanges {
  currentSettings: TypedChange<GridExportSchedule_CurrentSettings_DTO | null>;
  isLoading: TypedChange<boolean | null>;
}

@Component({
  selector: 'app-ges-settings-form',
  imports: [ReactiveFormsModule, NzButtonModule, NzInputNumberModule, NzSwitchModule, NzSpinModule],
  templateUrl: './ges-settings-form.component.html',
  styleUrl: './ges-settings-form.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GesSettingsFormComponent implements OnChanges {
  @Input({ required: true }) currentSettings: GridExportSchedule_CurrentSettings_DTO | null = null;
  @Input({ required: true }) isLoading: boolean | null = null;

  @Input({ required: true }) plantId: string | undefined;

  // NOTE: (submit) is a standard event, so we use (submitForm) to avoid collision
  @Output() submitForm = new EventEmitter<GridExportSchedule_UpdateSettings_DTO>();

  form: FormGroup<SettingsForm>;

  constructor() {
    this.form = new FormGroup<SettingsForm>({
      minExportPrice: new FormControl(0, { nonNullable: true }),
      autoEnableSchedules: new FormControl(false, { nonNullable: true }),
    });
  }

  ngOnChanges(changes: ComponentChanges): void {
    if (changes.currentSettings && changes.currentSettings.currentValue) {
      const newValue = changes.currentSettings.currentValue;
      this.form.setValue({
        minExportPrice: newValue.settings.minPriceToEnableExport,
        autoEnableSchedules: newValue.settings.autoEnableNewSchedules,
      });
    }
  }

  onSubmit() {
    const formValue = this.form.getRawValue();

    const plantId = this.currentSettings?.plantId || this.plantId || '';

    const result: GridExportSchedule_UpdateSettings_DTO = {
      plantId,
      settings: {
        minPriceToEnableExport: formValue.minExportPrice,
        autoEnableNewSchedules: formValue.autoEnableSchedules,
      },
    };

    this.submitForm.next(result);
  }
}
