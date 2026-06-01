import { SelectionModel } from '@angular/cdk/collections';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  NzTreeFlattener,
  NzTreeViewComponent,
  NzTreeViewFlatDataSource,
} from 'ng-zorro-antd/tree-view';
import { Observable, combineLatest, map } from 'rxjs';
import { ActivePowerLimitSchedule } from 'src/app/features/power-limit-schedule/_data/active-schedule';
import { DeviceState, DeviceType, ExtendedDeviceState, deviceStateColors } from '../../constants';
import { DeviceTreeItem, Plant, PowerLimitDetails } from '../../data/models';
import { UserSettingsService } from '../../data/services/user-settings.service';
import { MonbatActiveSchedule } from '../../features/monbat-batteries-schedule/_data/dto';
import { plsLink } from '../../helpers';

interface TreeNode {
  name: string;
  plantId: string;
  deviceId?: string;
  state?: ExtendedDeviceState;
  state$?: Observable<ExtendedDeviceState>;
  powerLimit$?: Observable<PowerLimitDetails | null>;
  disabled?: boolean;
  children?: TreeNode[];
  warningsCount$?: Observable<number>;
  offCount$?: Observable<number>;
  noCommunicationCount$?: Observable<number>;
  errorsCount$?: Observable<number>;
  powerLimitCount$?: Observable<number>;
  powerLimitSchedule$?: Observable<ActivePowerLimitSchedule | null>;
  bessSchedule$?: Observable<ActivePowerLimitSchedule | null>;
  monbatActiveSchedule$?: Observable<MonbatActiveSchedule | null>;
  deviceType: DeviceType;
}

/** Flat node with expandable and level information */
interface ExampleFlatNode extends TreeNode {
  expandable: boolean;
  level: number;
}

@Component({
  selector: 'app-devices-tree',
  templateUrl: './devices-tree.component.html',
  styleUrls: ['./devices-tree.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DevicesTreeComponent implements OnChanges, AfterViewInit {
  @Input() plants: Plant[] | null | undefined;
  @Input() selectedItem: DeviceTreeItem | undefined;
  @Input() hasFilter = true;

  @Output() itemSelect: EventEmitter<DeviceTreeItem> = new EventEmitter<DeviceTreeItem>();

  @ViewChild(NzTreeViewComponent, { static: true }) tree:
    | NzTreeViewComponent<ExampleFlatNode>
    | undefined;

  readonly levelAccessor = (dataNode: ExampleFlatNode): number => dataNode.level;
  readonly hasChild = (_: number, node: ExampleFlatNode): boolean => node.expandable;

  plantIdPrefix = 'id-plant-'; // Because selectors cannot start with a digit
  deviceIdPrefix = 'id-device-';

  DeviceState = DeviceState;
  warningColor = deviceStateColors[DeviceState.Warning];
  errorColor = deviceStateColors[DeviceState.Error];

  selectListSelection = new SelectionModel<ExampleFlatNode>();

  treeFlattener = new NzTreeFlattener(
    (node: TreeNode, level: number): ExampleFlatNode => ({
      expandable: !!node.children && node.children.length > 0,
      level,
      disabled: !!node.disabled,
      ...node,
    }),
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );

  dataSource!: NzTreeViewFlatDataSource<TreeNode, ExampleFlatNode>;

  private _treeElementRef: Element | null = null;

  private expandedPlantIds = new Set<string>();

  constructor(
    private _hostRef: ElementRef,
    private _userSettings: UserSettingsService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['plants']?.previousValue !== changes['plants']?.currentValue) {
      this._initTreeViewData();
    }

    if (changes['selectedItem']?.previousValue !== changes['selectedItem']?.currentValue) {
      this._selectItem(this.selectedItem);
      // if (this.selectedItem) {
      //   setTimeout(() => {
      //     this._scrollIntoViewIfNeeded();
      //   }, 500); // wait for expand animation to finish
      // }
    }
  }

  ngOnInit(): void {
    if (this.tree) {
      this.dataSource = new NzTreeViewFlatDataSource(this.tree, this.treeFlattener);
    }
  }

  ngAfterViewInit() {
    this._treeElementRef = (this._hostRef.nativeElement as HTMLElement).querySelector(
      `nz-tree-view`,
    );

    if (this.tree) {
      this._initTreeViewData();
    }

    this._selectItem(this.selectedItem);
    if (this.selectedItem) {
      setTimeout(() => {
        this._scrollIntoViewIfNeeded();
      }, 0); // we were waiting for expand animation to finish, but in afterviewinit it's not needed
    }
  }

  plsLink(
    plantId: string,
    activePowerLimitSchedule: ActivePowerLimitSchedule | null | undefined,
  ): string | undefined {
    const plant = this.plants?.find((plant) => plant.id === plantId);
    return plsLink(plant, activePowerLimitSchedule);
  }

  private _scrollIntoViewIfNeeded() {
    const selectedNode = this.selectListSelection.selected[0];
    if (selectedNode) {
      const nativeElement: HTMLElement = this._hostRef.nativeElement as HTMLElement;

      let targetNode;

      if (selectedNode.deviceId) {
        targetNode = nativeElement.querySelector(
          `#${this.deviceIdPrefix}${selectedNode.deviceId || ''}`,
        );
      } else {
        targetNode = nativeElement.querySelector(`#${this.plantIdPrefix}${selectedNode.plantId}`);
      }

      if (targetNode && !this._isInViewport(targetNode)) {
        targetNode.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }

  private _isInViewport(targetNodeElement: Element) {
    if (!this._treeElementRef) {
      return true;
    }

    const targetNodeBoundingRect = targetNodeElement.getBoundingClientRect();
    const treeViewBoundingRect = this._treeElementRef.getBoundingClientRect();

    return (
      targetNodeBoundingRect.top >= treeViewBoundingRect.top &&
      targetNodeBoundingRect.bottom <= treeViewBoundingRect.bottom
    );
  }

  private _selectItem(item: DeviceTreeItem | undefined) {
    if (!item) {
      this.selectListSelection.deselect(this.selectListSelection.selected[0]);
      return;
    }

    let selectedNode;

    const plantNode = this.tree?.dataNodes.find((node) => node.plantId === item.plantId);

    if (item.deviceId) {
      selectedNode = this.tree?.dataNodes.find(
        (node) => node.deviceId === item.deviceId && node.plantId === item.plantId,
      );
    } else {
      selectedNode = plantNode;
    }

    if (selectedNode) {
      this.selectListSelection.deselect(this.selectListSelection.selected[0]);
      this.selectListSelection.select(selectedNode);

      if (plantNode && plantNode !== selectedNode) {
        this.tree?.expand(plantNode);
      }
    }
  }

  private _initTreeViewData(filterOptions: string[] = [], initiatedByFilter = false) {
    if (!this.dataSource) {
      return;
    }

    const treeData: TreeNode[] = [];

    this.plants?.forEach((plant) => {
      const children = plant.devices
        .filter(
          (device) =>
            filterOptions.length === 0 || filterOptions.indexOf(device.state.baseState || '') >= 0,
        )
        .map((device) => ({
          deviceId: device.id,
          plantId: plant.id,
          name: device.name,
          state: device.state,
          state$: device.stateSubject.asObservable(),
          powerLimit$: device.powerLimitSubject.asObservable(),
          monbatActiveSchedule$: device.monbatActiveScheduleSubject?.asObservable(),
          deviceType: device.type,
        }));

      const childrenStateObservables = children.map((device) => device.state$);

      const warningsCount$ = combineLatest(childrenStateObservables).pipe(
        map((states) => states.filter((state) => state.baseState === DeviceState.Warning)),
        map((states) => states.length),
      );

      const errorsCount$ = combineLatest(childrenStateObservables).pipe(
        map((states) => states.filter((state) => state.baseState === DeviceState.Error)),
        map((states) => states.length),
      );

      const noCommunicationCount$ = combineLatest(childrenStateObservables).pipe(
        map((states) => states.filter((state) => state.baseState === DeviceState.NoCommunication)),
        map((states) => states.length),
      );

      const offCount$ = combineLatest(childrenStateObservables).pipe(
        map((states) => states.filter((state) => state.baseState === DeviceState.Off)),
        map((states) => states.length),
      );

      const powerLimitCount$ = combineLatest(children.map((device) => device.powerLimit$)).pipe(
        map((powerLimits) =>
          powerLimits.filter((powerLimit) => powerLimit !== undefined && powerLimit !== null),
        ),
        map((powerLimits) => powerLimits.length),
      );

      const plantNode: TreeNode = {
        plantId: plant.id,
        name: plant.name,
        warningsCount$,
        noCommunicationCount$,
        offCount$,
        errorsCount$,
        powerLimitCount$,
        powerLimitSchedule$: plant.activePowerLimitSchedule$.asObservable(),
        bessSchedule$: plant.activeBESSSchedule$.asObservable(),
        deviceType: plant.type,
        children,
      };

      if (plantNode.children?.length) {
        treeData.push(plantNode);
      }
    });

    this.dataSource.setData(treeData);

    // if ((this.plants?.length || 0) < 3) {
    //   // If there are only a few plants,
    //   // keep them always expanded

    //   this.tree?.expandAll();

    //   return;
    // }

    if (initiatedByFilter && filterOptions.length > 0) {
      // Showing filtered devices,
      // expand all plants containing devices matching the filter

      this.tree?.expandAll();
    } else {
      // No filter options,
      // expand only the saved expanded plants

      this.applyExpandedFromSettings();
    }
  }

  onClick(node: ExampleFlatNode, event: MouseEvent) {
    this.itemSelect.next({
      plantId: node.plantId,
      deviceId: node.deviceId,
      deviceType: node.deviceType,
      openInNewTab: event.metaKey || event.ctrlKey,
    });
  }

  onFilterChange(filterOptions: string[] = []) {
    this._initTreeViewData(filterOptions, true);
  }

  onNodeToggled(node: ExampleFlatNode): void {
    if (this.tree?.isExpanded(node)) {
      this.expandedPlantIds.add(node.plantId);
    } else {
      this.expandedPlantIds.delete(node.plantId);
    }

    this.saveExpandedPlantIds();
  }

  onExpandAll(): void {
    this.tree?.expandAll();

    const expandableNodes = this.tree?.dataNodes.filter((n) => n.expandable);
    this.expandedPlantIds = new Set(expandableNodes?.map((n) => n.plantId) ?? []);
    this.saveExpandedPlantIds();
  }

  onCollapseAll(): void {
    this.tree?.collapseAll();
    this.expandedPlantIds.clear();
    this.saveExpandedPlantIds();
  }

  isExpanded(node: ExampleFlatNode): boolean {
    return this.tree?.isExpanded(node) ?? false;
  }

  isPowerLimitScheduleActive(powerLimitSchedule: ActivePowerLimitSchedule | null) {}

  castPwSchedule(powerLimitSchedule: any): ActivePowerLimitSchedule {
    return powerLimitSchedule;
  }

  castMonbatSchedule(monbatSchedule: any): MonbatActiveSchedule | null {
    return monbatSchedule;
  }

  private saveExpandedPlantIds(): void {
    this._userSettings.updateCurrentUserSettings({
      devicesTreeViewExpandedPlantIds: Array.from(this.expandedPlantIds),
    });
  }

  private applyExpandedFromSettings(): void {
    const savedIds =
      this._userSettings.getCurrentUserSettings().devicesTreeViewExpandedPlantIds ?? [];
    this.expandedPlantIds = new Set(savedIds);

    // this.tree?.collapseAll();

    const nodesToExpand = this.tree?.dataNodes.filter(
      (node) => node.expandable && savedIds?.includes(node.plantId),
    );
    if (nodesToExpand) {
      nodesToExpand.forEach((node) => {
        this.tree?.expand(node);
      });
    }
  }
}
