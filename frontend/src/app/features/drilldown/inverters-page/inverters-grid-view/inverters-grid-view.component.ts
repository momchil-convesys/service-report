import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Observable } from 'rxjs';
import { Inverter_DTO, TransformerStation_DTO } from '../../../../data/dtos';
import { StaleDataService } from '../../../../data/services/stale-data.service';
import { InverterMetrics_DataPoint_DTO, TransformerStation_Metrics_DTO } from '../_data/dto';
import { InverterGridBoxComponent } from './inverter-grid-box/inverter-grid-box.component';

@Component({
  selector: 'app-inverters-grid-view',
  imports: [InverterGridBoxComponent, NzEmptyModule, NzSpinModule, AsyncPipe],
  templateUrl: './inverters-grid-view.component.html',
  styleUrl: './inverters-grid-view.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvertersGridViewComponent {
  @Input({ required: true }) metadata: TransformerStation_DTO[] = [];
  @Input({ required: true }) data: TransformerStation_Metrics_DTO[] = [];
  @Input({ required: true }) loading = false;

  constructor(private staleDataService: StaleDataService) {}

  get inverters(): Array<Inverter_DTO> {
    return this.metadata.map((tsMetadata) => tsMetadata.inverters).flat();
  }

  getInverterData(tsId: string, inverterId: string): InverterMetrics_DataPoint_DTO | undefined {
    return this.data
      .find((ts) => ts.deviceId === tsId)
      ?.inverterMetricsDataPoints.find((inv) => inv.inverterId === inverterId);
  }

  isStaleData(inverterData: InverterMetrics_DataPoint_DTO | undefined): Observable<boolean> {
    return this.staleDataService.isStaleData(inverterData?.timestamp);
  }
}
