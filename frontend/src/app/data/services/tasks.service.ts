import { Injectable } from '@angular/core';
import { concatMap, filter, map, mergeMap, Observable, of, ReplaySubject, tap } from 'rxjs';
import { DataRequest } from '../../constants';
import { ApiService } from '../api';
import { TaskNodeDefinition } from '../models';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private _cache: Observable<DataRequest<TaskNodeDefinition>> | undefined;
  private _nodesById: {
    [id: string]: TaskNodeDefinition;
  } = {};

  private _dataNeedsRefresh$ = new ReplaySubject<void>(1);

  constructor(private api: ApiService) {}

  getPredefinedTasks(): Observable<DataRequest<TaskNodeDefinition>> {
    if (this._cache) {
      return this._cache;
    }

    this._cache = this._dataNeedsRefresh$.pipe(
      mergeMap(() =>
        this.api.fetchRootTaskGroup().pipe(
          tap((res) => {
            if (!res.data) {
              return;
            }

            const rootNode: TaskNodeDefinition = res.data;

            const nodesById: {
              [id: string]: TaskNodeDefinition;
            } = {};

            this._fillNodesById(rootNode, 'NO PARENT', nodesById);

            this._nodesById = nodesById;
          }),
        ),
      ),
    );

    this._dataNeedsRefresh$.next();

    return this._cache;
  }

  private _fillNodesById(
    node: TaskNodeDefinition,
    parentNodeId: string | undefined,
    nodesByIdAcc: {
      [id: string]: TaskNodeDefinition;
    },
  ) {
    node.parentNodeId = parentNodeId;
    nodesByIdAcc[node.id] = node;

    if (!node.children || node.children.length === 0) {
      return;
    }

    node.children.map((child) => this._fillNodesById(child, node.id, nodesByIdAcc));
  }

  getNodeById(id: string): TaskNodeDefinition | undefined {
    return this._nodesById[id];
  }

  createTaskNode(
    newNode: TaskNodeDefinition,
    parentNodeId: string,
  ): Observable<DataRequest<unknown>> {
    const baseRequest = newNode.isLeaf
      ? this.api.createTaskDefinition(newNode)
      : this.api.createTaskGroupDefinition(newNode);

    return baseRequest.pipe(
      filter((req) => req.data !== undefined),
      map((req) => req.data as TaskNodeDefinition),
      concatMap((newNode) => {
        const parent: TaskNodeDefinition = this._nodesById[parentNodeId];
        return this.api.patchTaskNodeChildren(parentNodeId, [
          newNode.id,
          ...(parent?.childrenIds || []),
        ]);
      }),
      tap(() => this._dataNeedsRefresh$.next()),
    );
  }

  updateTaskNode(node: TaskNodeDefinition): Observable<DataRequest<unknown>> {
    const baseRequest = node.isLeaf
      ? this.api.updateTaskDefinition(node)
      : this.api.updateTaskGroupDefinition(node);

    return baseRequest.pipe(tap(() => this._dataNeedsRefresh$.next()));
  }

  deleteTaskNode(node: TaskNodeDefinition): Observable<DataRequest<unknown>> {
    if (!node.parentNodeId) {
      console.error('Missing parent node ID!', node);
      return of({ isLoading: false });
    }

    if (!node.id || node.id === '') {
      return of({ isLoading: false });
    }

    const parentNodeChildrenIds = this.getNodeById(node.parentNodeId)?.childrenIds || [];

    const baseRequest = node.isLeaf
      ? this.api.deleteTaskDefinition(node)
      : this.api.deleteTaskGroupDefinition(node);

    const patchChildrenRequest = this.api.patchTaskNodeChildren(
      node.parentNodeId,
      parentNodeChildrenIds.filter((childId) => childId !== node.id),
    );

    return baseRequest.pipe(
      concatMap(() => patchChildrenRequest),
      tap(() => this._dataNeedsRefresh$.next()),
    );
  }

  moveTaskNode(
    id: string,
    oldParentId: string,
    newParentId: string = 'root',
    index: number,
  ): Observable<DataRequest<unknown>> {
    const oldParentNodeChildrenIds = this.getNodeById(oldParentId)?.childrenIds || [];
    let newParentNodeChildrenIds = this.getNodeById(newParentId)?.childrenIds || [];

    // If moving in the same group, first remove node (in memory), as result from request is omitted
    if (oldParentId === newParentId) {
      newParentNodeChildrenIds = newParentNodeChildrenIds.filter((childId) => childId !== id);
    }

    console.log(
      'Moving task node: ',
      this.getNodeById(id),
      this.getNodeById(oldParentId),
      this.getNodeById(newParentId),
    );

    return this.api
      .patchTaskNodeChildren(
        oldParentId,
        oldParentNodeChildrenIds.filter((childId) => childId !== id),
      )
      .pipe(
        filter((data) => data.isLoading === false),
        tap(() => console.log('First request FINISHED')),
        concatMap(() =>
          this.api.patchTaskNodeChildren(newParentId, [
            ...newParentNodeChildrenIds.slice(0, index),
            id,
            ...newParentNodeChildrenIds.slice(index),
          ]),
        ),
        filter((data) => data.isLoading === false),
        tap(() => console.log('Second request FINISHED')),
        tap(() => this._dataNeedsRefresh$.next()),
        // concatMap(() => this.getPredefinedTasks(true)),
        // filter((data) => data.isLoading === false),
        // tap(() => console.log('Tree fetch request FINISHED'))
      );
  }
}
