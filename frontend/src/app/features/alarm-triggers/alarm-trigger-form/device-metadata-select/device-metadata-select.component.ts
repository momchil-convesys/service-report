import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { filter, map, Observable, shareReplay } from 'rxjs';

import { DataRequest } from '../../../../constants';
import { DeviceMetadata } from '../../../../data/models';
import { DeviceMetadataService } from '../../../../data/services/device-metadata.service';

interface MetadataGroupedByManufacturer {
  manufacturer: string;
  list: DeviceMetadata[];
}

@Component({
  selector: 'app-device-metadata-select',
  templateUrl: './device-metadata-select.component.html',
  styleUrls: ['./device-metadata-select.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DeviceMetadataSelectComponent {
  @Output() valueChange = new EventEmitter<string>();

  valueModel: string | undefined;

  request$: Observable<DataRequest<DeviceMetadata[]>>;
  groupedMetadata$: Observable<MetadataGroupedByManufacturer[]>;

  constructor(deviceMetadataService: DeviceMetadataService) {
    this.request$ = deviceMetadataService.getDeviceMetadataList().pipe(shareReplay(1));

    this.groupedMetadata$ = this.request$.pipe(
      map((request) => request.data),
      filter((data: DeviceMetadata[] | undefined): data is DeviceMetadata[] => data != undefined),
      map((metadataList) => {
        const byManufacturer: { [m: string]: DeviceMetadata[] } = {};
        metadataList.forEach((deviceMetadata) => {
          const currentValue = byManufacturer[deviceMetadata.manufacturer] || [];
          byManufacturer[deviceMetadata.manufacturer] = [...currentValue, deviceMetadata];
        });

        const groupedMetadata: MetadataGroupedByManufacturer[] = [];

        Object.keys(byManufacturer).forEach((manufacturer) => {
          groupedMetadata.push({
            manufacturer,
            list: byManufacturer[manufacturer],
          });
        });

        return groupedMetadata;
      }),
    );
  }

  onSelectedValueChange(value: string) {
    this.valueChange.emit(value);
  }
}
