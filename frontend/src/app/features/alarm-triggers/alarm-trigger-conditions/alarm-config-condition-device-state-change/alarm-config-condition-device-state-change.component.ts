import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, ReplaySubject, map, switchMap } from 'rxjs';
import { DataRequest, DeviceState, deviceStateFullLabels } from '../../../../constants';
import { DeviceMetadata } from '../../../../data/models';
import { DeviceMetadataService } from '../../../../data/services/device-metadata.service';
import { AlarmConditionDeviceStateChange } from '../../_data/models';

export interface AlarmConfigConditionForm_DeviceStateChange {
  stateOfInterest: FormControl<DeviceState>;
  persistenceSeconds: FormControl<number>;
}

@Component({
  selector: 'app-alarm-config-condition-device-state-change',
  templateUrl: './alarm-config-condition-device-state-change.component.html',
  styleUrls: ['./alarm-config-condition-device-state-change.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AlarmConfigConditionDeviceStateChangeComponent implements OnChanges {
  @Input() formGroup!: FormGroup<AlarmConfigConditionForm_DeviceStateChange>;
  @Input() metadataId: string | null = null;

  private _metadataId$ = new ReplaySubject<string>(1);

  deviceStateOptionsLoading$: Observable<boolean>;
  deviceStateOptions$: Observable<
    Array<{
      label: string;
      value: DeviceState;
    }>
  >;

  static createFormGroup(
    condition: AlarmConditionDeviceStateChange | undefined,
  ): FormGroup<AlarmConfigConditionForm_DeviceStateChange> {
    return new FormGroup<AlarmConfigConditionForm_DeviceStateChange>({
      stateOfInterest: new FormControl(condition?.stateOfInterest || null!, {
        nonNullable: true,
        validators: Validators.required,
      }),
      persistenceSeconds: new FormControl(condition?.persistenceSeconds || 0, {
        nonNullable: true,
        validators: Validators.required,
      }),
    });
  }

  constructor(private deviceMetadataService: DeviceMetadataService) {
    const metadataRequest$: Observable<DataRequest<DeviceMetadata | undefined>> =
      this._metadataId$.pipe(
        switchMap((metadataId) => this.deviceMetadataService.getDeviceMetadata(metadataId)),
      );

    this.deviceStateOptionsLoading$ = metadataRequest$.pipe(map((request) => request.isLoading));

    this.deviceStateOptions$ = metadataRequest$.pipe(
      map((request) =>
        (request.data?.possibleStates || []).map((value) => ({
          label: deviceStateFullLabels[value],
          value,
        })),
      ),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.metadataId) {
      console.warn(
        this.constructor.name,
        this.ngOnChanges.name,
        '| Component called with unexpected metadataId: ',
        this.metadataId,
      );
      return;
    }

    this._metadataId$.next(this.metadataId);
  }
}
