import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { FaultCountersData, FaultDefinitionGroup } from '../../../../data/models';
import { FaultsService } from '../../../../shared/faults-table/faults-service';

export interface TreeNodeInterface {
  key: string;
  name: string;
  level: number;
  isExpanded?: boolean;
  children?: TreeNodeInterface[];
  parent?: TreeNodeInterface;
  faultCode?: string;
  count?: number;
  severity?: string;
}

@Component({
  selector: 'app-fault-counters-table',
  templateUrl: './fault-counters-table.component.html',
  styleUrls: ['./fault-counters-table.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class FaultCountersTableComponent {
  @Input() faultGroups: FaultDefinitionGroup[] = [];
  @Input() faultCountersData: FaultCountersData | null = null;
  @Input() loadingData: boolean | null = false;
  @Input() hideFilteringOptions: boolean | undefined;

  mapOfExpandedData: { [key: string]: TreeNodeInterface[] } = {};
  listOfMapData: TreeNodeInterface[] = [];

  sortOrder: string | null = null;
  sortDirections = ['descend', null];

  selectedFaultIds$: Observable<Set<string>>;

  deviceIndices = [0]; //, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  showHeatMap = true;

  sortByCount = this._sortByCount.bind(this);

  constructor(private _faultsService: FaultsService) {
    this.selectedFaultIds$ = this._faultsService.selectedFaultIds$;
  }

  onFaultRowClick(faultId: string) {
    this._faultsService.toggleFaultSelection(faultId);
  }

  onSortCountColumnChange(order: string | null) {
    this.sortOrder = order;
  }

  onItemChecked(id: string, checked: boolean): void {
    this._faultsService.toggleFaultSelection(id, checked);
  }

  heatMapColorForValue(value: number) {
    if (this.showHeatMap) {
      return `rgba(240, 87, 87, ${value})`;
    }

    return 'transparent';
  }

  private _sortByCount(a: string, b: string) {
    if (!this.faultCountersData) {
      return 0;
    }

    return this.faultCountersData.values[b] - this.faultCountersData.values[a];
  }
}
