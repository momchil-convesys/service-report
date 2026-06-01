import { SelectionModel } from '@angular/cdk/collections';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
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
import { Subject, Subscription, takeUntil } from 'rxjs';

import { Plant } from '../../data/models';
import { PlantsService } from '../../data/services/plants.service';

interface TreeNode {
  id: string;
  name: string;
  disabled?: boolean;
  children?: TreeNode[];
}

interface FlatNode {
  id: string;
  name: string;
  expandable: boolean;
  level: number;
  disabled: boolean;
}

@Component({
  selector: 'app-device-select',
  templateUrl: './device-select.component.html',
  styleUrls: ['./device-select.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class DeviceSelectComponent implements OnDestroy, OnChanges {
  @Input() selectedDeviceIds: string[] = []; // ['storycounty-0'];
  @Input() filterByMetadataId: string | null = null;

  @Output() selectDevices = new EventEmitter<string[]>();

  plants: Plant[] = [];

  flatNodeMap = new Map<FlatNode, TreeNode>();
  nestedNodeMap = new Map<TreeNode, FlatNode>();
  checklistSelection = new SelectionModel<FlatNode>(true, []);

  @ViewChild(NzTreeViewComponent, { static: true }) tree!: NzTreeViewComponent<FlatNode>;

  readonly levelAccessor = (dataNode: FlatNode): number => dataNode.level;

  treeFlattener = new NzTreeFlattener(
    (node: TreeNode, level: number): FlatNode => {
      const existingNode = this.nestedNodeMap.get(node);
      const flatNode =
        existingNode && existingNode.name === node.name
          ? existingNode
          : {
              expandable: !!node.children && node.children.length > 0,
              id: node.id,
              name: node.name,
              level,
              disabled: !!node.disabled,
            };
      this.flatNodeMap.set(flatNode, node);
      this.nestedNodeMap.set(node, flatNode);
      return flatNode;
    },
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );

  dataSource!: NzTreeViewFlatDataSource<TreeNode, FlatNode>;

  private _subscription: Subscription | undefined;
  private _destroy$ = new Subject<void>();

  constructor(private data: PlantsService) {
    this.data
      .getPlants()
      .pipe(takeUntil(this._destroy$))
      .subscribe((req) => {
        if (req.data) {
          this.plants = req.data;
          this.dataSource.setData(this._constructPlantsTreeData(this.plants));
          this._handleExpandedState();
          this._handleChanges();
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterByMetadataId']) {
      this.dataSource.setData(this._constructPlantsTreeData(this.plants));
      this._handleExpandedState();
    }

    this._handleChanges();
  }

  ngOnInit(): void {
    if (this.tree) {
      this.dataSource = new NzTreeViewFlatDataSource(this.tree, this.treeFlattener);
    }
  }

  ngAfterViewInit(): void {
    if (this.tree) {
      this.dataSource.setData(this._constructPlantsTreeData(this.plants));
      this._handleExpandedState();
      this._handleChanges();
    }
  }

  ngOnDestroy(): void {
    this._subscription?.unsubscribe();
    this._destroy$.next();
  }

  onSelectAll() {
    this.checklistSelection.select(...this._getAllApplicable());
  }

  onDeselectAll() {
    this.checklistSelection.clear();
  }

  getSelectedDeviceIds(): string[] {
    return this.checklistSelection.selected
      .filter((node) => !node.expandable)
      .map((node) => node.id);
  }

  private _handleExpandedState() {
    if ((this.dataSource.getData().length || 0) < 3) {
      // If there are only a few plants,
      // keep them always expanded

      this.tree.expandAll();

      return;
    }
  }

  private _handleChanges() {
    const selectedNodes: FlatNode[] = this.tree.dataNodes.filter(
      (node) => this.selectedDeviceIds.indexOf(node.id) >= 0,
    );

    this.checklistSelection = new SelectionModel<FlatNode>(true, selectedNodes);
    this.checklistSelection.clear();

    selectedNodes.forEach((node) => {
      this.leafItemSelectionToggle(node);
    });

    this._subscription?.unsubscribe();

    this._subscription = this.checklistSelection.changed.subscribe((selection) => {
      if (selection.added.length === 1 && selection.added[0].expandable) {
        return;
      }

      if (selection.removed.length === 1 && selection.removed[0].expandable) {
        return;
      }

      this.selectDevices.next(this.getSelectedDeviceIds());
    });
  }

  private _getAllApplicable() {
    return this.tree.dataNodes.filter(
      (node) => !node.disabled, // TODO: filter by device version
    );
  }

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  descendantsAllSelected(node: FlatNode): boolean {
    const descendants = this.getDescendants(node);
    return (
      descendants.length > 0 &&
      descendants.every((child) => this.checklistSelection.isSelected(child))
    );
  }

  descendantsPartiallySelected(node: FlatNode): boolean {
    const descendants = this.getDescendants(node);
    const result = descendants.some((child) => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  leafItemSelectionToggle(node: FlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  itemSelectionToggle(node: FlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.getDescendants(node).filter((node) => !node.disabled);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    descendants.forEach((child) => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  checkAllParentsSelection(node: FlatNode): void {
    let parent: FlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  checkRootNodeSelection(node: FlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => this.checklistSelection.isSelected(child));
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  getParentNode(node: FlatNode): FlatNode | null {
    const currentLevel = node.level;

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.tree.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.tree.dataNodes[i];

      if (currentNode.level < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  private _constructPlantsTreeData(plants: Plant[]): TreeNode[] {
    return plants
      .map((plant) => {
        let disableParentNode = true;

        const children = plant.devices.map((device) => {
          const disabled = this.filterByMetadataId
            ? device.deviceMetadataId !== this.filterByMetadataId
            : false;

          if (!disabled) {
            // If there is at least one enabled device,
            // parent should be enabled as well
            disableParentNode = false;
          }

          return {
            id: device.id,
            name: device.name,
            disabled,
          };
        });

        if (children.length === 0) {
          return null;
        }

        return {
          id: plant.id,
          name: plant.name,
          disabled: disableParentNode,
          children,
        };
      })
      .filter((plant) => plant !== null);
  }

  private getDescendants(node: FlatNode): FlatNode[] {
    const flatNodes = this.dataSource.getFlattenData();
    const startIndex = flatNodes.indexOf(node);

    if (startIndex < 0) {
      return [];
    }

    const descendants: FlatNode[] = [];
    const nodeLevel = node.level;

    for (let i = startIndex + 1; i < flatNodes.length; i++) {
      const current = flatNodes[i];

      // Once we reach a sibling or parent, stop
      if (current.level <= nodeLevel) {
        break;
      }

      descendants.push(current);
    }

    return descendants;
  }
}
