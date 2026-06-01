import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { map, Subject } from 'rxjs';
import { DataRequest } from '../../../constants';
import { TaskNodeDefinition } from '../../../data/models';
import { TasksService } from '../../../data/services/tasks.service';
import { NodeMove, NodeSelection } from '../task-tree-edit/task-tree-edit.component';

@Component({
  selector: 'app-tasks-edit',
  templateUrl: './tasks-edit.component.html',
  styleUrls: ['./tasks-edit.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksEditComponent implements OnChanges {
  @Input() rootNode!: TaskNodeDefinition;

  selectedNode$ = new Subject<TaskNodeDefinition | undefined>();
  selectedNodeIds$ = this.selectedNode$.pipe(
    map((node: TaskNodeDefinition | undefined) => (node ? [node.id] : [])),
  );

  constructor(private dataService: TasksService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this._assertInputsProvided();
  }

  onNodeSelect(selection: NodeSelection) {
    if (selection.selectedNodeId) {
      const selectedNode = this.dataService.getNodeById(selection.selectedNodeId);
      if (selectedNode) {
        this.selectedNode$.next(selectedNode);
      } else {
        const tmpNode: TaskNodeDefinition = {
          id: selection.selectedNodeId,
          name: selection.selectedNodeIsLeaf ? 'New task' : 'New group',
          description: '',
          childrenIds: [],
          parentNodeId: selection.parentNodeId || 'wtf',
          isLeaf: selection.selectedNodeIsLeaf,
          forceOrder: true,
        };
        // Newly created node, not saved yet
        this.selectedNode$.next(tmpNode);
      }
    } else {
      this.selectedNode$.next(undefined);
    }
  }

  onCancel() {
    this.selectedNode$.next(undefined);
    this.rootNode = { ...this.rootNode };
  }

  onSave(taskNode: TaskNodeDefinition) {
    // TODO: unsubscribe
    if (taskNode.id.startsWith('tmp-node-id')) {
      this.dataService.createTaskNode(taskNode, taskNode.parentNodeId || 'wtf').subscribe((req) => {
        this.selectedNode$.next((<DataRequest<TaskNodeDefinition>>req).data);
      });
    } else {
      this.dataService.updateTaskNode(taskNode).subscribe((req) => {
        this.selectedNode$.next((<DataRequest<TaskNodeDefinition>>req).data);
      });
    }
  }

  onDelete(taskNode: TaskNodeDefinition) {
    // TODO: unsubscribe
    if (taskNode.id.startsWith('tmp-node-id')) {
      this.onCancel();
    } else {
      this.dataService.deleteTaskNode(taskNode).subscribe(() => {
        this.selectedNode$.next(undefined);
      });
    }
  }

  onNodeMove(moveEvent: NodeMove) {
    const currentNode = this.dataService.getNodeById(moveEvent.nodeId);
    const oldParentId = currentNode?.parentNodeId;

    if (!oldParentId) {
      console.error('Old parent id was not resolved for node: ', currentNode);
      return;
    }

    this.dataService
      .moveTaskNode(moveEvent.nodeId, oldParentId, moveEvent.newParentId, moveEvent.index)
      // .pipe(concatMap(() => this.dataService.getPredefinedTasks(true)))
      .subscribe();
  }

  private _assertInputsProvided(): void {
    if (!this.rootNode) {
      throw new Error(
        `${this.constructor.name} | ` + $localize`The required input [rootNode] was not provided.`,
      );
    }
  }
}
