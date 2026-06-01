import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { FaultDefinition, FaultDefinitionGroup } from '../../data/models';

export interface TreeNodeInterface {
  key: string;
  name: string;
  level: number;
  originId: string;
  isExpanded?: boolean;
  children?: TreeNodeInterface[];
  parent?: TreeNodeInterface;
  faultCode?: string;
  count?: number;
  severity?: string;
}

export interface ExtraColumn {
  thTemplate: TemplateRef<any>;
  tdTemplate: TemplateRef<any>;
  colspan?: number;
  sortFn?: (a: string, b: string) => number;
}

@Component({
  selector: 'app-faults-table',
  templateUrl: './faults-table.component.html',
  styleUrls: ['./faults-table.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class FaultsTableComponent implements OnChanges {
  @Input() faultGroups: FaultDefinitionGroup[] = [];
  @Input() extraColumns: ExtraColumn[] = [];
  @Input() loadingData: boolean | null = null;
  @Input() scrollable = false;
  @Input() hideFilteringOptions: boolean | undefined;

  @Output() faultRowClick = new EventEmitter<string>();

  mapOfExpandedData: { [key: string]: TreeNodeInterface[] } = {};
  listOfMapData: TreeNodeInterface[] = [];

  searchFilterValue: string | null = null;

  groupItems = false;
  showMajorOnly = false;

  constructor() {}

  ngOnChanges() {
    this._initializeTableData();
  }

  onGroupItemsChange(event: boolean) {
    this.groupItems = event;
    this._initializeTableData();
  }

  onSeverityFilterChange(event: boolean) {
    this.showMajorOnly = event;
    this._initializeTableData();
  }

  onSearchFilterChange(value: string | null) {
    if (value && value.length > 0) {
      this.searchFilterValue = value;
    } else {
      this.searchFilterValue = null;
    }
    this._initializeTableData();
  }

  onExpandChange(array: TreeNodeInterface[], data: TreeNodeInterface, event: boolean): void {
    if (!event) {
      if (data.children) {
        data.children.forEach((d) => {
          const target = array.find((a) => a.key === d.key);
          if (target) {
            target.isExpanded = false;
            this.onExpandChange(array, target, false);
          }
        });
      } else {
        return;
      }
    }
  }

  onRowClick(item: TreeNodeInterface) {
    if (item.faultCode && !window.getSelection()?.toString()) {
      this.faultRowClick.emit(item.originId);
    }
  }

  onRowTextSelect(event: MouseEvent) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }

  toggleExpandForAllNodes(expand: boolean) {
    Object.values(this.mapOfExpandedData).forEach((node) => {
      node.forEach((nestedNode) => (nestedNode.isExpanded = expand));
    });
  }

  private _initializeTableData() {
    if (this.groupItems) {
      this.listOfMapData = this.faultGroups.map((group) => this._adaptGroup(group));
    } else {
      this.listOfMapData = this.faultGroups
        .map((group) => group.faults.map((fault) => this._adaptFault(fault)))
        .flat()
        .filter((node) => this._filterBySeverity(node))
        .filter((node) => this._filterBySearchString(node));

      this.extraColumns.forEach((extraCol) => {
        this.listOfMapData.sort((a, b) => {
          if (extraCol.sortFn) {
            return extraCol.sortFn(a.originId, b.originId);
          }
          return 0;
        });
      });
    }

    this.listOfMapData.forEach((item) => {
      this.mapOfExpandedData[item.key] = this._convertTreeToList(item);
    });
  }

  private _convertTreeToList(root: TreeNodeInterface): TreeNodeInterface[] {
    const stack: TreeNodeInterface[] = [];
    const array: TreeNodeInterface[] = [];
    const hashMap = {};
    stack.push({ ...root, level: 0, isExpanded: true });

    while (stack.length !== 0) {
      const node = stack.pop();
      if (node) {
        this._visitNode(node, hashMap, array);
        if (node.children) {
          for (let i = node.children.length - 1; i >= 0; i--) {
            stack.push({
              ...node.children[i],
              // level: node.level + 1,
              isExpanded: false,
              parent: node,
            });
          }
        }
      }
    }

    return array;
  }

  private _visitNode(
    node: TreeNodeInterface,
    hashMap: { [key: string]: boolean },
    array: TreeNodeInterface[],
  ): void {
    if (!hashMap[node.key]) {
      hashMap[node.key] = true;
      array.push(node);
    }
  }

  private _adaptGroup(group: FaultDefinitionGroup): TreeNodeInterface {
    const children = group.faults
      .map((fault) => this._adaptFault(fault))
      .filter((node) => this._filterBySeverity(node))
      .filter((node) => this._filterBySearchString(node));

    this.extraColumns.forEach((extraCol) => {
      children.sort((a, b) => {
        if (extraCol.sortFn) {
          return extraCol.sortFn(a.originId, b.originId);
        }
        return 0;
      });
    });

    return {
      key: 'g' + group.id,
      originId: group.id,
      name: `${group.code} ${group.name}`,
      level: 0,
      children,
    };
  }

  private _adaptFault(fault: FaultDefinition): TreeNodeInterface {
    return {
      key: 'f' + fault.id,
      originId: fault.id,
      name: `${fault.name}`,
      faultCode: `${fault.code}`,
      level: 1,
      severity: fault.isMajor ? 'high' : '',
    };
  }

  private _filterBySeverity(node: TreeNodeInterface) {
    if (this.showMajorOnly) {
      return node.severity === 'high';
    } else {
      return true;
    }
  }

  private _filterBySearchString(node: TreeNodeInterface) {
    if (!this.searchFilterValue) {
      return true;
    }

    const lowercaseSerachString = this.searchFilterValue.toLowerCase();
    if (node.faultCode && node.faultCode.toLocaleLowerCase().indexOf(lowercaseSerachString) >= 0) {
      return true;
    }

    return node.name.toLowerCase().indexOf(lowercaseSerachString) >= 0;
  }
}
