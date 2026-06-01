import { animate, style, transition, trigger } from '@angular/animations';
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
import { DeviceParameterDefinition } from '../../../../data/models';
import { DeviceMetrics } from '../../_data/device-metrics.model';
import { GroupedParameter, ParameterMappingService } from '../../_data/parameter-mapping.service';
import { DmChartsService } from './dm-charts.service';

@Component({
  selector: 'app-device-metrics-charts',
  templateUrl: './device-metrics-charts.component.html',
  styleUrls: ['./device-metrics-charts.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DmChartsService],
  animations: [
    trigger('inOutAnimation', [
      transition(
        ':enter',
        [
          style({ height: 0, opacity: 0 }),
          animate('0.5s ease-out', style({ height: '{{height}}px', opacity: 1 })),
        ],
        { params: { height: 200 } },
      ),
      transition(
        ':leave',
        [
          style({ height: '{{height}}px', opacity: 1 }),
          animate('0.3s ease-in', style({ height: 0, opacity: 0 })),
        ],
        { params: { height: 200 } },
      ),
    ]),
  ],
  standalone: false,
})
export class DeviceMetricsChartsComponent implements OnChanges {
  @Input() data: DeviceMetrics[] = [];
  @Input() parameters: DeviceParameterDefinition[] | null = null;
  @Input() visibleParameterIds: string[] = [];
  @Input() isLoading = false;
  @Input() shouldUseParameterGroupingByName: boolean = false;

  @Output() visibleParametersChange = new EventEmitter<string[]>();

  private _chartsVisibility: { [parameterName: string]: boolean } = {};
  groupedParameters: GroupedParameter[] = [];

  constructor(private parameterMappingService: ParameterMappingService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parameters'] && this.parameters && this.shouldUseParameterGroupingByName) {
      this.groupedParameters = this.parameterMappingService.groupParametersByName(this.parameters);
    }
    this.updateChartsVisibility();
  }

  onFilterRowClick(parameterNameOrId: string, event: MouseEvent) {
    event.preventDefault();

    const currentVisibilityValue = this._chartsVisibility[parameterNameOrId];
    this._chartsVisibility[parameterNameOrId] = !currentVisibilityValue;

    this.emitVisibleParametersChange();
  }

  onSelectAll() {
    if (this.shouldUseParameterGroupingByName) {
      this.groupedParameters.forEach((groupedParam) => {
        this._chartsVisibility[groupedParam.name] = true;
      });
    } else {
      this.parameters?.forEach((param) => {
        this._chartsVisibility[param.id] = true;
      });
    }

    this.emitVisibleParametersChange();
  }

  onDeselectAll() {
    if (this.shouldUseParameterGroupingByName) {
      this.groupedParameters.forEach((groupedParam) => {
        this._chartsVisibility[groupedParam.name] = false;
      });
    } else {
      this.parameters?.forEach((param) => {
        this._chartsVisibility[param.id] = false;
      });
    }

    this.emitVisibleParametersChange();
  }

  isChartVisible(parameterNameOrId: string) {
    return this._chartsVisibility[parameterNameOrId];
  }

  private emitVisibleParametersChange() {
    const visibleParameterIds: string[] = [];

    if (this.shouldUseParameterGroupingByName) {
      this.groupedParameters.forEach((groupedParam) => {
        if (this._chartsVisibility[groupedParam.name]) {
          // Add all parameter IDs from the grouped parameter
          visibleParameterIds.push(...groupedParam.parameterIds);
        }
      });
    } else {
      this.parameters?.forEach((param) => {
        if (this._chartsVisibility[param.id]) {
          visibleParameterIds.push(param.id);
        }
      });
    }

    this.visibleParametersChange.next(visibleParameterIds);
  }

  private updateChartsVisibility() {
    this._chartsVisibility = {};

    if (this.shouldUseParameterGroupingByName) {
      this.groupedParameters.forEach((groupedParam) => {
        // Check if any of the parameter IDs in this group are visible
        const isVisible = groupedParam.parameterIds.some(
          (paramId) => this.visibleParameterIds.indexOf(paramId) >= 0,
        );
        this._chartsVisibility[groupedParam.name] = isVisible;
      });
    } else {
      this.parameters?.forEach((param) => {
        this._chartsVisibility[param.id] = this.visibleParameterIds.indexOf(param.id) >= 0;
      });
    }
  }
}
