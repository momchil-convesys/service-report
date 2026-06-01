import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { DeviceState, deviceStateFullLabels } from '../../constants';
import { PlantsService } from '../../data/services/plants.service';

@Component({
  selector: 'app-state-filter',
  templateUrl: './state-filter.component.html',
  styleUrls: ['./state-filter.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class StateFilterComponent implements OnInit {
  @Output() filterChange = new EventEmitter<string[]>();

  labels = deviceStateFullLabels;

  stateFilter: { label: string; value: DeviceState }[] = [];

  listOfTagOptions = [];

  isOpenSelect = false;

  constructor(plantsService: PlantsService) {
    this.stateFilter = plantsService.getPossibleDeviceStates().map((state) => ({
      label: this.labels[state],
      value: state,
    }));
  }

  ngOnInit(): void {}

  onFilterChange(filterOptions: string[] = []) {
    this.filterChange.next(filterOptions);
    this.isOpenSelect = false;
  }
}
