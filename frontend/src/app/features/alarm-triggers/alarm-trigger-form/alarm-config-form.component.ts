/* eslint-disable @typescript-eslint/unbound-method */
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { alarmConfigTitles, AlarmTriggerType } from '../../../constants';
import { User } from '../../../data/models';
import { DeviceSelectComponent } from '../../../shared/device-select/device-select.component';
import {
  AlarmConditionDeviceStateChange,
  AlarmConditionFaultRecurrence,
  AlarmConditionParameterBoundaries,
  AlarmConditionType,
  AlarmTrigger,
  TriggerDeleteAction,
} from '../_data/models';
import {
  AlarmConfigConditionDeviceStateChangeComponent,
  AlarmConfigConditionForm_DeviceStateChange,
} from '../alarm-trigger-conditions/alarm-config-condition-device-state-change/alarm-config-condition-device-state-change.component';
import {
  AlarmConfigConditionForm_FaultOccurence,
  AlarmsConfigConditionFaultOccurenceComponent,
} from '../alarm-trigger-conditions/alarms-config-condition-fault-occurence/alarms-config-condition-fault-occurence.component';
import {
  AlarmConfigConditionForm_ParameterBoundaries,
  AlarmsConfigConditionParameterBoundariesComponent,
} from '../alarm-trigger-conditions/alarms-config-condition-parameter-boundaries/alarms-config-condition-parameter-boundaries.component';
import { AlarmTriggerNotifyUsersSelectComponent } from '../alarm-trigger-notify-users-select/alarm-trigger-notify-users-select.component';

interface AlarmConfigFormInterface {
  id: FormControl<string | null>;
  enabled: FormControl<boolean>;
  title: FormControl<string>;
  description: FormControl<string | null>;
  type: FormControl<AlarmTriggerType>;
  triggerIf: FormControl<'any' | 'all'>;
  deviceMetadataId: FormControl<string | null>;
  conditions: FormArray<
    FormGroup<
      | AlarmConfigConditionForm_FaultOccurence
      | AlarmConfigConditionForm_DeviceStateChange
      | AlarmConfigConditionForm_ParameterBoundaries
    >
  >;
  affectedDeviceIds: FormControl<string[]>;
  muteDurationMinutes: FormControl<number>;
  notifyUsersByEmail: FormControl<User[]>;
  muteAction: FormControl<'mute' | 'disable'>;
}

@Component({
  selector: 'app-alarm-config-form',
  templateUrl: './alarm-config-form.component.html',
  styleUrls: ['./alarm-config-form.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AlarmConfigFormComponent implements OnChanges, OnDestroy {
  @Input() selectedTrigger: AlarmTrigger | undefined;

  @Output() create = new EventEmitter<AlarmTrigger>();
  @Output() update = new EventEmitter<AlarmTrigger>();
  @Output() delete = new EventEmitter<TriggerDeleteAction>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('deviceSelect') deviceSelect: DeviceSelectComponent | undefined;
  @ViewChild('notifyUsersSelect') notifyUsersSelect:
    | AlarmTriggerNotifyUsersSelectComponent
    | undefined;

  form!: FormGroup<AlarmConfigFormInterface>;

  alarmConfigTitles = alarmConfigTitles;
  AlarmTriggerType = AlarmTriggerType;

  triggerTypeOptions: { label: string; value: AlarmTriggerType }[] = Object.values(
    AlarmTriggerType,
  ).map((value) => ({
    label: alarmConfigTitles[value],
    value,
  }));

  private _triggerTypeChangeSubscription: Subscription | undefined;
  private _deviceMetadataChangeSubscription: Subscription | undefined;
  private _muteActionChangeSubscription: Subscription | undefined;

  constructor(private el: ElementRef) {
    this._initForm(undefined);
  }

  ngOnChanges(): void {
    this.form.reset();
    this._initForm(this.selectedTrigger);
  }

  ngOnDestroy(): void {
    this._triggerTypeChangeSubscription?.unsubscribe();
    this._deviceMetadataChangeSubscription?.unsubscribe();
    this._muteActionChangeSubscription?.unsubscribe();
  }

  onCancel() {
    this.cancel.next();
  }

  onDeleteAlarmTrigger(triggerDeleteAction: TriggerDeleteAction) {
    this.delete.emit(triggerDeleteAction);
  }

  onDeviceMetadataSelectionChange(deviceMetadataId: string) {
    this.form.controls.deviceMetadataId.setValue(deviceMetadataId);
  }

  onRemoveCondition(index: number) {
    this.form.controls.conditions.removeAt(index);
  }

  fakeTypeCastConditionForm(
    conditionForm: FormGroup<
      | AlarmConfigConditionForm_FaultOccurence
      | AlarmConfigConditionForm_DeviceStateChange
      | AlarmConfigConditionForm_ParameterBoundaries
    >,
  ): any {
    return conditionForm;
  }

  onAddCondition(condition: AlarmConditionType | undefined) {
    const type: AlarmTriggerType = this.form.controls.type.value;
    let fg: FormGroup | undefined;

    switch (type) {
      case AlarmTriggerType.ParameterBoundaries:
        fg = AlarmsConfigConditionParameterBoundariesComponent.createFormGroup(
          <AlarmConditionParameterBoundaries>condition,
        );
        break;

      case AlarmTriggerType.FaultRecurrence:
        fg = AlarmsConfigConditionFaultOccurenceComponent.createFormGroup(
          <AlarmConditionFaultRecurrence>condition,
        );
        break;

      case AlarmTriggerType.DeviceStateChange:
        fg = AlarmConfigConditionDeviceStateChangeComponent.createFormGroup(
          <AlarmConditionDeviceStateChange>condition,
        );
        break;
    }

    if (fg) {
      this.form.controls.conditions.push(fg);
    }
  }

  onSubmit() {
    this.form.updateValueAndValidity();

    this.markAllControlsAsDirty(Object.values(this.form.controls));

    if (!this.form.valid) {
      setTimeout(() => {
        let firstInvalidControl: HTMLElement | undefined = this.el.nativeElement.querySelector(
          '.ant-form-item-has-error',
        );

        if (!firstInvalidControl) {
          firstInvalidControl = this.el.nativeElement.querySelector('.ant-alert-error');
        }

        firstInvalidControl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);

      return;
    }

    const formValue = this.form.getRawValue();

    // console.log(this.constructor.name, this.onSubmit.name, '| Form value: ', formValue);

    const alarmTrigger: AlarmTrigger = {
      id: formValue.id || undefined,
      title: formValue.title,
      description: formValue.description || '',
      type: formValue.type,
      enabled: formValue.enabled,
      deviceMetadataId: formValue.deviceMetadataId,
      affectedDeviceIds: formValue.affectedDeviceIds,
      triggerIf: formValue.triggerIf,
      conditions: formValue.conditions,
      muteDurationMinutes: formValue.muteAction === 'mute' ? formValue.muteDurationMinutes : -1,
      notifyUsersByEmail: formValue.notifyUsersByEmail,
      relatedEventsCount: 0,
    };

    const selectdDeviceIds = this.deviceSelect?.getSelectedDeviceIds();
    alarmTrigger.affectedDeviceIds = selectdDeviceIds || [];

    const selectedNotifyUsers = this.notifyUsersSelect?.getSelectedUsers();
    alarmTrigger.notifyUsersByEmail = selectedNotifyUsers || [];

    this._saveAlarm(alarmTrigger);
  }

  private _saveAlarm(alarmTrigger: AlarmTrigger) {
    if (this.selectedTrigger) {
      this.update.emit(alarmTrigger);
    } else {
      this.create.emit(alarmTrigger);
    }
  }

  private _initForm(trigger: AlarmTrigger | undefined) {
    this.form = new FormGroup<AlarmConfigFormInterface>({
      id: new FormControl(trigger?.id || null),
      enabled: new FormControl(true, { nonNullable: true }),
      title: new FormControl('', { validators: Validators.required, nonNullable: true }),
      description: new FormControl(null),
      type: new FormControl(AlarmTriggerType.FaultRecurrence, { nonNullable: true }),
      triggerIf: new FormControl('any', { nonNullable: true }),
      deviceMetadataId: new FormControl(trigger?.deviceMetadataId || null, {
        validators: Validators.required,
      }),
      conditions: new FormArray<FormGroup<any>>([], {
        validators: Validators.required,
      }),
      muteAction: new FormControl('mute', { nonNullable: true }),
      muteDurationMinutes: new FormControl(30, {
        validators: Validators.required,
        nonNullable: true,
      }),
      notifyUsersByEmail: new FormControl(trigger?.notifyUsersByEmail || [], { nonNullable: true }),
      affectedDeviceIds: new FormControl(trigger?.affectedDeviceIds || [], { nonNullable: true }),
    });

    if (trigger) {
      this.form.patchValue(trigger);
      trigger.conditions.forEach((condition) => {
        this.onAddCondition(condition);
      });

      if (trigger.muteDurationMinutes > 0) {
        this.form.controls.muteAction.setValue('mute');
      } else {
        this.form.controls.muteAction.setValue('disable');
        this.form.controls.muteDurationMinutes.setValue(30);
        this.form.controls.muteDurationMinutes.disable({ emitEvent: false });
      }
    }

    this._triggerTypeChangeSubscription?.unsubscribe();
    this._triggerTypeChangeSubscription = this.form.controls.type.valueChanges.subscribe(() => {
      this.form.controls.conditions.clear();
      this.onAddCondition(undefined);
    });

    this._deviceMetadataChangeSubscription?.unsubscribe();
    this._deviceMetadataChangeSubscription =
      this.form.controls.deviceMetadataId.valueChanges.subscribe(() => {
        this.form.controls.conditions.clear();
        this.onAddCondition(undefined);
      });

    this._muteActionChangeSubscription?.unsubscribe();
    this._muteActionChangeSubscription = this.form.controls.muteAction.valueChanges.subscribe(
      (muteActionValue) => {
        if (muteActionValue === 'mute') {
          this.form.controls.muteDurationMinutes.enable({ emitEvent: false });
        } else {
          this.form.controls.muteDurationMinutes.disable({ emitEvent: false });
        }
      },
    );
  }

  public markAllControlsAsDirty(abstractControls: AbstractControl[]): void {
    abstractControls.forEach((abstractControl) => {
      abstractControl.markAsDirty({ onlySelf: true });

      if (abstractControl instanceof FormGroup) {
        this.markAllControlsAsDirty(Object.values((abstractControl as FormGroup).controls));
      } else if (abstractControl instanceof FormArray) {
        this.markAllControlsAsDirty((abstractControl as FormArray).controls);
      }
    });
  }
}
