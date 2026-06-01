import {
  ChangeDetectionStrategy,
  Component,
  Input,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { interval, map, Observable, startWith } from 'rxjs';
import { ONE_SECOND, TypedChange } from '../../../constants';
import { calcScheduleAdjustmentPercentageFormatted } from '../../../helpers/_schedule-adjustment-coefficient';
import { plsUnitsMap, PowerLimitSchedule, PowerLimitScheduleParsedTableRow } from '../_data/models';
import { getPositionInTimeForInterval } from '../helpers';
import {
  collapseTableTreeTreeNode,
  convertGroupsTreeNodes,
  convertTreeToList,
  groupTableRowsByHour,
  TableRowBase,
  TableRowGroupBase,
  TableTreeNode,
} from '../helpers-table-group-intervals';

interface ComponentChanges extends SimpleChanges {
  data: TypedChange<PowerLimitSchedule | undefined>;
}

interface TableRow extends TableRowBase {
  data: PowerLimitScheduleParsedTableRow;
}

interface TableRowGroup extends TableRowGroupBase<TableRow> {}

type TreeNode = TableTreeNode<TableRow, TableRowGroup>;

@Component({
  selector: 'app-pls-preview-table',
  templateUrl: './pls-preview-table.component.html',
  styleUrls: ['./pls-preview-table.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PlsPreviewTableComponent {
  @Input() data: PowerLimitSchedule | undefined;

  listOfMapData: TreeNode[] = [];
  mapOfExpandedData: { [key: string]: TreeNode[] } = {};

  expandSet = new Set<string>();

  private _timer$ = interval(ONE_SECOND * 5);

  get showInGroups() {
    return (this.data?.integrationPeriodMinutes || 60) < 60;
  }

  get showEnergyEquivallent() {
    return this.data?.limitType === 'power' && (this.data?.integrationPeriodMinutes || 60) < 60;
  }

  get scheduleAdjustmentPercentageFormatted() {
    const formatted = calcScheduleAdjustmentPercentageFormatted(
      this.data?.powerLimitTargetCoefficient || 1,
    );
    return formatted.replace('(', '').replace(')', '').replace(' ', '').replace('+', ' +');
  }

  ngOnChanges(changes: ComponentChanges): void {
    if (changes.data) {
      const initialDataLoad = changes.data.previousValue?.id !== changes.data.currentValue?.id;

      const listOfMapData = this._convertDataToTreeNodes(changes.data.currentValue);

      const expandedNodeKeys = initialDataLoad
        ? listOfMapData
            .filter((node) =>
              this.showInGroups ? this._initiallyExpanded(node.hourIntervalData) : true,
            )
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

  private _getRowClass(node: TreeNode): string {
    const interval = node.hourIntervalData?.interval || node.subIntervalData?.interval;

    if (!interval) {
      return 'future';
    }

    const position = getPositionInTimeForInterval(interval.start, interval.end);

    // Display current group interval as past
    if (position === 'present' && node.hourIntervalData) {
      return 'past';
    }

    return position;
  }

  getRowClass(node: TreeNode): Observable<string> {
    return this._timer$.pipe(
      startWith(0),
      map(() => this._getRowClass(node)),
    );
  }

  getUnitSuffixFormatted(): string {
    if (this.data?.limitType) {
      return ` ${plsUnitsMap[this.data.limitType]}`;
    }

    return '';
  }

  toggleExpandGroupRow(target: TreeNode) {
    // Check if group row as the click handler is on each <tr>

    if (target.hourIntervalData) {
      target.expand = !target.expand;
    }
  }

  collapse(array: TreeNode[], data: TreeNode, event: boolean): void {
    return collapseTableTreeTreeNode(array, data, event);
  }

  private _initiallyExpanded(tableRowGroup: TableRowGroup | undefined): boolean {
    if (!tableRowGroup) {
      return false;
    }

    const hasMeaningfullData = tableRowGroup.tableRows?.find((row) => row.data.targetLimit_Mega);

    if (hasMeaningfullData) {
      return true;
    }

    // TODO: check if this works ok with time zones

    const positionInTime = getPositionInTimeForInterval(
      tableRowGroup.interval.start,
      tableRowGroup.interval.end,
    );

    if (positionInTime === 'present') {
      return true;
    }

    return false;
  }

  private _convertDataToTreeNodes(inputData: PowerLimitSchedule | undefined): TreeNode[] {
    const tableRows: TableRow[] =
      inputData?.parsedScheduleTable.map((row) => ({
        interval: row.interval,
        data: row,
      })) || [];

    const tableRowGroups: TableRowGroup[] = groupTableRowsByHour(tableRows);

    return convertGroupsTreeNodes(tableRowGroups);
  }

  private _convertTreeToList(root: TreeNode, expandedNodeKeys: string[]): TreeNode[] {
    return convertTreeToList(root, expandedNodeKeys);
  }
}
