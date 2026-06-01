import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { DataRequest } from '../../../../constants';
import { DeviceMetadata } from '../../../../data/models';
import { DeviceMetadataService } from '../../../../data/services/device-metadata.service';

@Component({
  selector: 'app-device-metadata-display[deviceMetadataId]',
  templateUrl: './device-metadata-display.component.html',
  styleUrls: ['./device-metadata-display.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DeviceMetadataDisplayComponent implements OnChanges {
  @Input({ required: true }) deviceMetadataId!: string;

  request$: Observable<DataRequest<DeviceMetadata | undefined>> | undefined;

  constructor(private deviceMetadataService: DeviceMetadataService) {}

  ngOnChanges(): void {
    this.request$ = this.deviceMetadataService
      .getDeviceMetadata(this.deviceMetadataId)
      .pipe(shareReplay(1));
  }
}
