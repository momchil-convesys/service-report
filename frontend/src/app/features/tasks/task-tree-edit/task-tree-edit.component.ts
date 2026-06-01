import {
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
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNode } from 'ng-zorro-antd/tree';
import { TaskNodeDefinition } from '../../../data/models';

export interface NodeSelection {
  selectedNodeIsLeaf: boolean;
  selectedNodeId?: string;
  parentNodeId?: string;
}

export interface NodeMove {
  nodeId: string;
  newParentId: string | undefined; // undefined for root node
  index: number;
}

@Component({
  selector: 'app-task-tree-edit',
  templateUrl: './task-tree-edit.component.html',
  styleUrls: ['./task-tree-edit.component.less'],
  encapsulation: ViewEncapsulation.None,
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTreeEditComponent implements OnChanges {
  @Input() treeRootNode: TaskNodeDefinition | null = null;
  @Input() selectedIds: string[] = [];

  @Output() nodeSelect = new EventEmitter<NodeSelection>();
  @Output() nodeMove = new EventEmitter<NodeMove>();

  @ViewChild('treeRef') treeRef: NzTreeComponent | undefined;
  @ViewChild('treeRef', { read: ElementRef }) treeElementRef: ElementRef | undefined;

  nodes: NzTreeNode[] = [];

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (!this.treeRootNode) {
      return;
    }

    if (simpleChanges['treeRootNode']) {
      const taskGroups = this.treeRootNode.children || [];
      this.nodes = taskGroups.map((node) => this._constructTreeRecursively(node));
      this.selectedIds = [...this.selectedIds];
    }
  }

  onClick(event: NzFormatEmitEvent): void {
    const selectedKey =
      event.selectedKeys && event.selectedKeys.length > 0 ? event.selectedKeys[0].key : undefined;
    this.nodeSelect.next({
      selectedNodeId: selectedKey,
      parentNodeId: undefined,
      selectedNodeIsLeaf: event.node?.isLeaf || false,
    });
  }

  onDrop(event: NzFormatEmitEvent) {
    if (!event.dragNode) {
      return;
    }

    const newParent: NzTreeNode | null = event.dragNode.parentNode || null;
    let index = 0;

    if (newParent) {
      index = newParent.children.indexOf(event.dragNode);
    } else {
      // Inserting in root
      const nodes = this.treeRef?.getTreeNodes() || [];
      index = nodes.indexOf(event.dragNode);
    }

    const moveEvent: NodeMove = {
      nodeId: event.dragNode.key,
      newParentId: newParent?.key,
      index: index,
    };

    this.nodeMove.emit(moveEvent);
  }

  onCreateNode(leaf: boolean) {
    if (!this.treeRef) {
      return;
    }

    const newKey = 'tmp-node-id-' + Date.now().toString();
    const newNode = new NzTreeNode(
      {
        title: leaf ? 'New task (not saved)' : 'New group (not saved)',
        key: newKey,
        isLeaf: leaf,
        expanded: true,
      },
      null,
    );

    let parentNode: NzTreeNode | null = null;

    if (this.selectedIds.length > 0) {
      const selectedNode = this.treeRef.getTreeNodeByKey(this.selectedIds[0]);
      parentNode = selectedNode?.isLeaf ? selectedNode.parentNode : selectedNode;

      newNode.parentNode = parentNode;

      if (parentNode) {
        this.treeRef.getTreeNodeByKey(parentNode.key)?.addChildren([newNode]);
      } else {
        this.nodes = [...this.treeRef.getTreeNodes(), newNode];
      }
    } else {
      this.nodes = [...this.treeRef.getTreeNodes(), newNode];
    }

    this.nodeSelect.next({
      selectedNodeId: newNode.key,
      parentNodeId: parentNode?.key || this.treeRootNode?.id,
      selectedNodeIsLeaf: leaf,
    });

    setTimeout(() => {
      const treeNativeElement: HTMLElement = this.treeElementRef?.nativeElement as HTMLElement;
      if (treeNativeElement) {
        const newNodeElement = treeNativeElement.querySelector(`.ant-tree-treenode-selected`);
        newNodeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 0);
  }

  private _constructTreeRecursively(node: TaskNodeDefinition) {
    if (node.isLeaf) {
      return new NzTreeNode({
        title: node.name,
        key: node.id,
        isLeaf: true,
        selected: false,
        selectable: true,
      });
    }

    const treeNode = new NzTreeNode({
      title: node.name,
      key: node.id,
      expanded: true,
      isLeaf: false,
      selected: false,
      selectable: true,
    });

    if (node.children) {
      treeNode.addChildren(
        node.children.map((child: TaskNodeDefinition) => this._constructTreeRecursively(child)),
      );
    }

    return treeNode;
  }
}
