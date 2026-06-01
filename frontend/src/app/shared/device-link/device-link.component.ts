import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { Device, Plant } from '../../data/models';
import { PlantsService } from '../../data/services/plants.service';

@Component({
  selector: 'app-device-link',
  templateUrl: './device-link.component.html',
  styleUrls: ['./device-link.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DeviceLinkComponent implements OnChanges {
  @Input() deviceId: string | undefined;
  @Input() deviceLink = false;
  @Input() devicePath = false;

  currentDevice$: Observable<Device | undefined> = of(undefined);
  plant$: Observable<Plant | undefined> = of(undefined);

  constructor(private data: PlantsService) {}

  ngOnChanges(): void {
    this.currentDevice$ = this.deviceId
      ? this.data.getDeviceById(this.deviceId).pipe(map((request) => request.data))
      : of(undefined);

    // this.plant$ = this.currentDevice$.pipe(
    //   map((device) => device?.plantId),
    //   switchMap((plantId) =>
    //     plantId ? this.data.getPlant(plantId).pipe(map((request) => request.data)) : of(undefined)
    //   )
    // );

    this.plant$ = this.currentDevice$.pipe(
      map((device) => device?.id),
      switchMap((deviceId) =>
        deviceId
          ? this.data.getPlantByDeviceId(deviceId).pipe(map((request) => request.data))
          : of(undefined),
      ),
    );
  }
}
