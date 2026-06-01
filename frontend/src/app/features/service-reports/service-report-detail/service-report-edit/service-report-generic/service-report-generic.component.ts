import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NzCheckboxOption } from 'ng-zorro-antd/checkbox';
import { ReportService } from 'src/app/features/service-reports/report.service';

@Component({
  selector: 'app-service-report-generic',
  templateUrl: './service-report-generic.component.html',
  styleUrls: ['./service-report-generic.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class ServiceReportGenericComponent implements OnInit {
  errorTipRequired = $localize`This field is required!`;
  @Input() genericData!: any | {};
  @Output() dataChange: EventEmitter<any> = new EventEmitter();

  filteredInventoryItems = [];
  typeActivityOptions: NzCheckboxOption[];
  constructor(public reportService: ReportService) {
    this.typeActivityOptions = [
      { label: $localize`Repair`, value: 'repair' },
      { label: $localize`Commissioning`, value: 'commissioning' },
      { label: $localize`Maintenance`, value: 'maintenance' },
      { label: $localize`Exchange`, value: 'exchange' },
      { label: $localize`Update`, value: 'update' },
      { label: $localize`Training`, value: 'training' },
      { label: $localize`Other`, value: 'other' },
    ];
  }

  ngOnInit(): void {
    if (this.genericData && this.genericData['plantId']) {
      this.getDevicesOptionOnPlantId(this.genericData['plantId'], false);
    }
    this.reportService.formGroup.valueChanges.subscribe((values) => {
      //   console.log(' valueChanges values', values);
      let deviceRelated = {};
      if (this.genericData && this.genericData['deviceId']) {
        deviceRelated = this.getDeviceIdRelatedData(
          this.genericData['deviceId'],
          this.reportService.reportData['devices'],
        );
      }

      this.genericData = {
        ...this.genericData,
        ...values,
        ...deviceRelated,
      };
      this.dataChange.emit(this.genericData);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.genericData && this.genericData['plantId']) {
      this.getDevicesOptionOnPlantId(this.genericData['plantId'], false);
    }

    if (changes['genericData']?.currentValue) {
      this.setFGValue(this.reportService.formGroup, changes['genericData'].currentValue);
    }
  }
  getDevicesOptionOnPlantId(plantId: any, shouldReset: boolean) {
    let plantRelated: any = {};

    if (shouldReset) {
      this.reportService.formGroup.controls['deviceId'].reset();
    }
    if (this.genericData) {
      const userPlants = this.reportService.reportData['userPlants'] || [];
      const selectedPlant = userPlants.find((el: any) => el.id === plantId);

      if (selectedPlant) {
        this.reportService.reportData['devices'] = selectedPlant.devices || [];
        plantRelated = {
          country: selectedPlant.country,
          plantName: selectedPlant.name || selectedPlant.display || selectedPlant.plant,
        };
      }

      /*
      this.reportService.reportData['userPlants']
        .filter((el: any) => el.id === plantId)
        .map((el1: any) => {
          this.reportService.reportData['devices'] = el1.devices;
          plantRelated = { country: el1.country };
        });
      */

      const deviceRelated = this.getDeviceIdRelatedData(
        this.genericData['deviceId'],
        this.reportService.reportData['devices'],
      );
      this.genericData = {
        ...this.genericData,
        ...{
          deviceId: this.reportService.formGroup.get('deviceId')!.value,
          ...deviceRelated,
          ...plantRelated,
        },
      };
    }

    this.dataChange.emit(this.genericData);
  }

  getDataonDeviceId(deviceId: any) {
    const deviceRelated = this.getDeviceIdRelatedData(
      deviceId,
      this.reportService.reportData['devices'],
    );

    this.genericData = {
      ...this.genericData,
      ...deviceRelated,
    };
    this.dataChange.emit(this.genericData);
  }
  onSubmit() {
    // console.log('onSubmit ', this.genericData);
  }
  private setFGValue(group: FormGroup, data: any): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.controls[key];

      abstractControl.setValue(data[key] || null);
    });
  }
  private getDeviceIdRelatedData(deviceId: string, devices: any[]): any {
    let device = {};
    const availableDevices =
      devices ||
      this.reportService.reportData['devices'] ||
      this.reportService.reportData['userPlants']?.find(
        (plant: any) => plant.id === this.genericData?.['plantId'],
      )?.devices ||
      [];

    if (deviceId) {
      let deviceRaw = availableDevices.find((el: any) => el.id === deviceId);
      //  console.log('deviceRaw', deviceRaw);
      if (deviceRaw) {
        device = {
          inverterType: deviceRaw.type,
          installedPowerKw: deviceRaw.installedPowerKw,
          deviceSerialNumber: deviceRaw.serialNumber,
        };
      }
    } else {
      device = {
        inverterType: '',
        installedPowerKw: '',
        deviceSerialNumber: '',
      };
    }
    return device;
  }
}
