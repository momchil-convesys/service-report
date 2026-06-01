import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { InverterString_DTO } from '../../../../data/dtos';
import { ValueDisplayComponent } from '../../../../shared/value-display/value-display.component';
import { InverterStringMetrics_DataPoint_DTO } from '../_data/dto';

@Component({
  selector: 'app-inverter-strings-data-view',
  standalone: true,
  imports: [ValueDisplayComponent],
  templateUrl: './inverter-strings-data-view.component.html',
  styleUrl: './inverter-strings-data-view.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InverterStringsDataViewComponent {
  @Input({ required: true }) stringsMetadata: InverterString_DTO[] = [];
  @Input({ required: true }) stringsData: Array<InverterStringMetrics_DataPoint_DTO> = [];

  getDataForStringById(stringId: string): {
    voltage: number | null | undefined;
    electricCurrent: number | null | undefined;
  } {
    return (
      this.stringsData.find((s) => s.stringId === stringId) || {
        voltage: undefined,
        electricCurrent: undefined,
      }
    );
  }
}
