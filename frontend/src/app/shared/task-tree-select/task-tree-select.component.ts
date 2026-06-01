import { SelectionModel } from '@angular/cdk/collections';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  NzTreeFlattener,
  NzTreeViewComponent,
  NzTreeViewFlatDataSource,
} from 'ng-zorro-antd/tree-view';
import { Subscription } from 'rxjs';
import { TaskNodeDefinition } from '../../data/models';

interface TreeNode {
  id: string;
  name: string;
  disabled?: boolean;
  children?: TreeNode[];
}

interface FlatNode {
  id: string;
  expandable: boolean;
  name: string;
  level: number;
  disabled: boolean;
}

@Component({
  selector: 'app-task-tree-select',
  templateUrl: './task-tree-select.component.html',
  styleUrls: ['./task-tree-select.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTreeSelectComponent implements OnInit, OnChanges, OnDestroy {
  @Input() treeRootNode: TaskNodeDefinition | null = null;
  @Input() checkable = true;

  @Output() selectTree = new EventEmitter<TaskNodeDefinition>();

  private _subscription: Subscription | undefined;

  flatNodeMap = new Map<FlatNode, TreeNode>();
  nestedNodeMap = new Map<TreeNode, FlatNode>();
  checklistSelection = new SelectionModel<FlatNode>(true);

  @ViewChild(NzTreeViewComponent, { static: true }) tree!: NzTreeViewComponent<FlatNode>;

  readonly levelAccessor = (dataNode: FlatNode): number => dataNode.level;

  treeFlattener = new NzTreeFlattener(
    (node: TreeNode, level: number): FlatNode => {
      const existingNode = this.nestedNodeMap.get(node);
      const flatNode =
        existingNode && existingNode.name === node.name
          ? existingNode
          : {
              id: node.id,
              expandable: !!node.children && node.children.length > 0,
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

  ngOnInit(): void {
    if (this.tree) {
      this.dataSource = new NzTreeViewFlatDataSource(this.tree, this.treeFlattener);
    }

    this._subscription = this.checklistSelection.changed.subscribe(() => {
      if (this.treeRootNode) {
        const subTreeNode = this._getSelectedSubTree(
          this.treeRootNode,
          this.checklistSelection.selected.map((node) => node.id),
        );

        this.selectTree.next(subTreeNode);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.tree) {
      this.dataSource = new NzTreeViewFlatDataSource(this.tree, this.treeFlattener);
    }
  }

  ngOnChanges() {
    if (!this.treeRootNode) {
      return;
    }

    const taskGroups = this._treeDataFromRootNode(this.treeRootNode); // this.treeRootNode.children || [];
    this.dataSource.setData(taskGroups.children || []);
    this.tree.expandAll();
  }

  ngOnDestroy(): void {
    this._subscription?.unsubscribe();
  }

  private _getSelectedSubTree(node: TaskNodeDefinition, selectedIds: string[]): TaskNodeDefinition {
    if (!node.children || node.children.length === 0) {
      return { ...node };
    }

    return {
      ...node,
      children: node.children
        .map((childNode) => this._getSelectedSubTree(childNode, selectedIds))
        .filter(
          (childNode) =>
            childNode.children?.length || 0 > 0 || selectedIds.indexOf(childNode.id) >= 0,
        ),
    };
  }

  private _treeDataFromRootNode(node: TaskNodeDefinition): TreeNode {
    if (!node.children || node.children.length === 0) {
      return {
        id: node.id,
        name: node.name,
        children: [],
      };
    }

    return {
      id: node.id,
      name: node.name,
      children: node.children?.map((child) => this._treeDataFromRootNode(child)),
    };
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
    if (!this.checkable) {
      return;
    }
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  itemSelectionToggle(node: FlatNode): void {
    if (!this.checkable) {
      return;
    }
    this.checklistSelection.toggle(node);
    const descendants = this.getDescendants(node);
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
