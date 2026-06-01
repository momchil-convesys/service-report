import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { NzTreeFlatDataSource, NzTreeFlattener } from 'ng-zorro-antd/tree-view';
import { BehaviorSubject } from 'rxjs';
import { Ticket, TicketTaskNode } from '../../../data/models';

function isTaskNodeStatusOkToContinue(taskNode: TicketTaskNode): boolean {
  return taskNode.status === 'approved' || taskNode.status === 'done';
}

interface TreeNode {
  id: string;
  name: string;
  origin: TicketTaskNode;

  children?: TreeNode[];
}

interface FlatNode {
  id: string;
  name: string;
  origin: TicketTaskNode;
  disabled: BehaviorSubject<boolean>;

  expandable: boolean;
  level: number;
}

@Component({
  selector: 'app-ticket-tasks[ticket]',
  templateUrl: './ticket-tasks.component.html',
  styleUrls: ['./ticket-tasks.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketTasksComponent implements OnChanges {
  @Input() ticket!: Ticket;

  selectedTask$ = new BehaviorSubject<TicketTaskNode | null>(null);

  flatNodeMap = new Map<FlatNode, TreeNode>();
  nestedNodeMap = new Map<TreeNode, FlatNode>();
  checklistSelection = new SelectionModel<FlatNode>(true);

  treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

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
              disabled: new BehaviorSubject(!node.origin.enabled),
              level,
              origin: node.origin,
            };
      this.flatNodeMap.set(flatNode, node);
      this.nestedNodeMap.set(node, flatNode);
      return flatNode;
    },
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );

  dataSource = new NzTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(private cd: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    const previousTicketValue = <Ticket | undefined>changes['ticket'].previousValue;
    const currentTicketValue = <Ticket | undefined>changes['ticket'].currentValue;

    if (!currentTicketValue?.tasksRoot) {
      return;
    }

    // Update whole tree data only if another ticket was selected. Otherwise this component handles synchronization of
    // changes/updates related to task nodes with inmemory model (DESTRUCTIVELY!).
    if (previousTicketValue?.id !== currentTicketValue?.id) {
      const taskGroups = this._treeDataFromRootNode(currentTicketValue.tasksRoot); // this.treeRootNode.children || [];
      this.dataSource.setData(taskGroups.children || []);

      // this.treeControl.expandAll();
    } else {
      this._treeDataFromRootNode(currentTicketValue.tasksRoot); // this.treeRootNode.children || [];
    }
  }

  private _treeDataFromRootNode(node: TicketTaskNode): TreeNode {
    if (node.isLeaf) {
      return {
        id: node.id,
        name: node.taskNodeDefinition.name,
        origin: node,
        children: [],
      };
    }

    const group = {
      id: node.id,
      name: node.taskNodeDefinition.name,
      origin: node,
      children: node.children?.map((child) => this._treeDataFromRootNode(child)),
    };

    for (let i = 0; i < group.children.length; ++i) {
      if (group.origin.status === 'in-progress' || group.id === 'roottt') {
        if (group.origin.taskNodeDefinition.forceOrder || group.id === 'roottt') {
          if (i === 0) {
            // First in group
            group.children[i].origin.enabled = true;
          } else {
            group.children[i].origin.enabled = isTaskNodeStatusOkToContinue(
              group.children[i - 1].origin,
            );
          }
        } else {
          group.children[i].origin.enabled = true;
        }

        const flatTreeNode = this.treeControl.dataNodes.find(
          (dataNode) => dataNode.origin.id === group.children[i].id,
        );
        if (flatTreeNode) {
          flatTreeNode.disabled.next(!group.children[i].origin.enabled);
          flatTreeNode.origin = group.children[i].origin;
        }
      }
    }

    return group;
  }

  onNodeClick(node: FlatNode) {
    this.selectedTask$.next(node.origin);
  }
}
