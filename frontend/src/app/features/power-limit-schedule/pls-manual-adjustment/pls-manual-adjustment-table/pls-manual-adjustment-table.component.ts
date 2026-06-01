import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { TypedChange } from '../../../../constants';
import { calcScheduleAdjustmentPercentageFormatted } from '../../../../helpers/_schedule-adjustment-coefficient';
import { BaseChartContext } from '../../../../shared/base-chart-component/base-chart-component.component';
import { PlsEquivalentIconComponent } from '../../../../shared/power-limit/pls-equivalent-icon/pls-equivalent-icon.component';
import { PlsValueFormattedComponent } from '../../../../shared/power-limit/pls-value-formatted/pls-value-formatted.component';
import { ValueDisplayComponent } from '../../../../shared/value-display/value-display.component';
import { PVProductionData } from '../../../pv-charts/pv-production-chart/_data/pv-production';
import { plsUnitsMap } from '../../_data/models';
import { getZonedPositionInTime, PositionInTime } from '../../helpers';
import {
  collapseTableTreeTreeNode,
  convertGroupsTreeNodes,
  convertTreeToList,
  groupTableRowsByHour,
  TableTreeNode,
} from '../../helpers-table-group-intervals';
import { PlsManualAdjustmentCellTargetComponent } from '../pls-manual-adjustment-cell-target/pls-manual-adjustment-cell-target.component';
import {
  PlsManualAdjustment_ModalComponentData,
  PlsManualAdjustment_ModalComponentResult,
  PlsManualAdjustmentModalComponent,
} from '../pls-manual-adjustment-modal/pls-manual-adjustment-modal.component';
import { TableRow, TableRowGroup, transformInputData } from './_data-helpers';

interface ComponentChanges extends SimpleChanges {
  data: TypedChange<PVProductionData | undefined>;
  loading: TypedChange<boolean>;
  context: TypedChange<BaseChartContext | null>;
}

type TreeNode = TableTreeNode<TableRow, TableRowGroup>;

@Component({
  selector: 'app-pls-manual-adjustment-table',
  imports: [
    CommonModule,
    NzTableModule,
    ValueDisplayComponent,
    PlsValueFormattedComponent,
    NzIconModule,
    NzButtonModule,
    PlsManualAdjustmentCellTargetComponent,
    PlsEquivalentIconComponent,
  ],
  providers: [NzModalService],
  templateUrl: './pls-manual-adjustment-table.component.html',
  styleUrl: './pls-manual-adjustment-table.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlsManualAdjustmentTableComponent implements OnChanges {
  @Input({ required: true }) data: PVProductionData | undefined;
  @Input({ required: true }) loading: boolean | undefined;

  @Input({ required: true }) context: BaseChartContext | null = null;

  @Input({ required: true }) scheduleAdjustmentCoefficient: number = 1;

  listOfMapData: TreeNode[] = [];
  mapOfExpandedData: { [key: string]: TreeNode[] } = {};

  expandSet = new Set<string>();

  get scheduleAdjustmentPercentageFormatted() {
    if (this.scheduleAdjustmentCoefficient === 1) {
      return null;
    }

    const formatted = calcScheduleAdjustmentPercentageFormatted(this.scheduleAdjustmentCoefficient);
    return formatted.replace('(', '').replace(')', '').replace(' ', '');
  }

  get powerLimitType() {
    return this.data?.powerLimitType;
  }

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
  ) {}

  ngOnChanges(changes: ComponentChanges): void {
    if (changes.data) {
      const initialDataLoad =
        changes.data.previousValue?.targetRange?.from.toISOString() !==
        changes.data.currentValue?.targetRange?.from.toISOString();

      const listOfMapData = this._convertDataToTreeNodes(changes.data.currentValue);

      const expandedNodeKeys = initialDataLoad
        ? listOfMapData
            .filter((node) => this._initiallyExpanded(node.hourIntervalData))
            .map((node) => node.key)
        : Object.values(this.mapOfExpandedData)
            .flat()
            .filter((node) => !node.parent && node.expand)
            .map((node) => node.key);

      this.listOfMapData = listOfMapData;

      this.mapOfExpandedData = {};
      this.listOfMapData.forEach((item) => {
        this.mapOfExpandedData[item.key] = this._convertTreeToList(item, expandedNodeKeys);
      });
    }
  }

  getUnitSuffixFormatted(): string {
    if (this.powerLimitType) {
      return ` ${plsUnitsMap[this.powerLimitType]}`;
    }

    return '';
  }

  onClickAdjust(row: TreeNode) {
    if (!row.subIntervalData) {
      return;
    }

    if (this.context?.plant.activePowerLimitSchedule$.getValue() === null) {
      this.modal.error({
        nzTitle: $localize`No active schedule`,
        nzContent: $localize`A schedule must be enabled to make adjustments.`,
      });

      return;
    }

    this.modal.create<
      PlsManualAdjustmentModalComponent,
      PlsManualAdjustment_ModalComponentData,
      PlsManualAdjustment_ModalComponentResult
    >({
      nzTitle: $localize`Adjust target for interval`,
      nzContent: PlsManualAdjustmentModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        data: row.subIntervalData,
        plant: this.context?.plant,
      },
      nzFooter: null,
      nzBodyStyle: {
        padding: '0',
      },
    });
  }

  onExpandChange(key: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(key);
    } else {
      this.expandSet.delete(key);
    }
  }

  getRowClass(node: TreeNode): PositionInTime {
    if (node.subIntervalData?.interval) {
      return getZonedPositionInTime(
        node.subIntervalData?.interval.start,
        node.subIntervalData?.interval.end,
        this.context?.plant.timeZone,
      );
    }

    if (node.hourIntervalData?.interval) {
      const position = getZonedPositionInTime(
        node.hourIntervalData?.interval.start,
        node.hourIntervalData?.interval.end,
        this.context?.plant.timeZone,
      );

      // Display current group interval as past
      if (position === 'present' && node.expand) {
        return 'past';
      }

      return position;
    }

    return 'future';
  }

  collapse(array: TreeNode[], data: TreeNode, event: boolean): void {
    return collapseTableTreeTreeNode(array, data, event);
  }

  toggleExpandGroupRow(target: TreeNode) {
    // Check if group row as the click handler is on each <tr>

    if (target.hourIntervalData) {
      target.expand = !target.expand;
    }
  }

  toggleExpandSubInterval(target: TreeNode) {
    if (this.expandSet.has(target.key)) {
      this.expandSet.delete(target.key);
    } else {
      this.expandSet.add(target.key);
    }
  }

  private _initiallyExpanded(tableRowGroup: TableRowGroup | undefined): boolean {
    if (!tableRowGroup) {
      return false;
    }

    const hasMeaningfullData = tableRowGroup.tableRows?.find(
      (row) => row.production_MWh || row.targetLimitDetails.activeRecord?.targetLimit,
    );

    if (hasMeaningfullData) {
      return true;
    }

    const positionInTime = getZonedPositionInTime(
      tableRowGroup.interval.start,
      tableRowGroup.interval.end,
      this.context?.plant.timeZone,
    );

    if (positionInTime === 'present') {
      return true;
    }

    return false;
  }

  private _convertDataToTreeNodes(inputData: PVProductionData | undefined): TreeNode[] {
    const tableRows: TableRow[] = transformInputData(inputData, this.context?.plant.timeZone);
    const tableRowGroups: TableRowGroup[] = groupTableRowsByHour<TableRow, TableRowGroup>(
      tableRows,
    );

    return convertGroupsTreeNodes(tableRowGroups);
  }

  private _convertTreeToList(root: TreeNode, expandedNodeKeys: string[]): TreeNode[] {
    return convertTreeToList(root, expandedNodeKeys);
  }
}
