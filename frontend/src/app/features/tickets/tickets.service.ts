import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  mergeMap,
  Observable,
  of,
  ReplaySubject,
  switchMap,
  tap,
} from 'rxjs';
import { DataRequest } from '../../constants';
import { DataAdapter } from '../../data/adapters';
import { ApiService } from '../../data/api';
import {
  Ticket,
  TicketActivityDetailsComment,
  TicketActivityDetailsTaskGroupEdit,
  TicketActivityDetailsTaskStatusChange,
  TicketActivityItem,
  TicketActivityType,
  TicketTaskGroup,
  TicketTaskNode,
} from '../../data/models';
import { MockUser, MockUsersService } from '../../data/services/mock-users.service';

function sortByTimestamp(a: Ticket, b: Ticket) {
  return (b.createdBy?.timestamp.getTime() || 0) - (a.createdBy?.timestamp.getTime() || 0);
}

@Injectable()
export class TicketsService {
  private _cache: Observable<DataRequest<Ticket[]>> | undefined;
  private _ticketRequestsById: {
    [id: string]: BehaviorSubject<DataRequest<Ticket>>;
  } = {};

  private _dataNeedsRefresh$ = new ReplaySubject<void>(1);

  constructor(
    private api: ApiService,
    private usersService: MockUsersService,
  ) {}

  getTickets(): Observable<DataRequest<Ticket[]>> {
    if (this._cache) {
      return this._cache;
    }

    this._cache = this._dataNeedsRefresh$.pipe(
      mergeMap(() =>
        this.api.fetchTickets().pipe(
          map((req) => ({
            ...req,
            data: req.data && req.data?.sort(sortByTimestamp),
          })),
        ),
      ),
    );

    this._dataNeedsRefresh$.next();

    return this._cache;
  }

  getTicket(ticketId: string): Observable<DataRequest<Ticket>> {
    const ticketStream = this._ticketRequestsById[ticketId];
    if (ticketStream) {
      return ticketStream;
    }

    return this.api.fetchTicket(ticketId).pipe(
      mergeMap((req) => {
        const ticketStream = this._ticketRequestsById[ticketId];
        if (ticketStream) {
          ticketStream.next(req);
        } else {
          this._ticketRequestsById[ticketId] = new BehaviorSubject(req);
        }

        return this._ticketRequestsById[ticketId];
      }),
    );
  }

  deleteComment(ticketId: string, activityItemId: string) {
    return this.getTicket(ticketId)
      .pipe(
        filter((req) => req.data !== undefined),
        map((req) => req.data as Ticket),
      )
      .pipe(
        map((ticket) => {
          return ticket.activityLog.filter((item) => item.id !== activityItemId);
        }),
        mergeMap((activityItems) => {
          return this.api
            .updateTicketActivity(ticketId, activityItems)
            .pipe(filter((req) => req.data !== undefined));
        }),
        mergeMap(() => this.api.fetchTicket(ticketId)),
      );
  }

  updateTaskNode(ticketId: string, taskNode: TicketTaskNode): Observable<DataRequest<Ticket>> {
    const ticket = this._ticketRequestsById[ticketId].getValue().data;
    const tasksRoot = ticket?.tasksRoot;
    if (!ticket || !tasksRoot) {
      console.error('Ticket not found in cache! ID: ', ticketId);
      return of({
        isLoading: false,
        error: new Error('Method updateTaskNode() received invalid arguments.'),
      });
    }

    // TODO: this section will not be necessary here

    return this.usersService.currentUser.pipe(
      mergeMap((user) => {
        const activityDetails = taskNode.isLeaf
          ? <TicketActivityDetailsTaskStatusChange>{
              taskName: taskNode.taskNodeDefinition.name,
              status: taskNode.status,
            }
          : <TicketActivityDetailsTaskGroupEdit>{
              taskGroupName: taskNode.taskNodeDefinition.name,
              assignedTo: taskNode.assignedTo
                ? this.usersService.getUserDisplayString(taskNode.assignedTo)
                : 'Removed assignee',
              status: taskNode.status,
            };

        const activityItems: TicketActivityItem[] = [
          {
            id: Date.now().toString(),
            userId: user.id,
            timestamp: DataAdapter.modelToDtoTimestamp(new Date()),
            type: taskNode.isLeaf
              ? TicketActivityType.TaskStatusChanged
              : TicketActivityType.TaskGroupEdited,
            details: activityDetails,
          },
        ];

        if (taskNode.taskNodeDefinition.parentNodeId) {
          const updatedTaskRoot = this._findAndReplaceTicketTaskNode(
            tasksRoot,
            taskNode.id,
            taskNode,
          );

          const parentGroup: TicketTaskNode | undefined = this._findTicketTaskNode(
            updatedTaskRoot,
            taskNode.taskNodeDefinition.parentNodeId + 'tt',
          );

          if (
            parentGroup &&
            !parentGroup.isLeaf &&
            !parentGroup.children.find(
              (node) => node.status !== 'done' && node.status !== 'approved',
            )
          ) {
            activityItems.push({
              id: Date.now().toString(),
              userId: user.id,
              timestamp: DataAdapter.modelToDtoTimestamp(new Date()),
              type: TicketActivityType.TaskGroupEdited,
              details: <TicketActivityDetailsTaskGroupEdit>{
                taskGroupName: parentGroup.taskNodeDefinition.name,
                assignedTo: parentGroup.assignedTo
                  ? this.usersService.getUserDisplayString(parentGroup.assignedTo)
                  : 'Removed assignee',
                status: parentGroup.status,
              },
            });
          }
        }

        return this.api.updateTicketActivity(ticketId, [...ticket.activityLog, ...activityItems]);
      }),
      mergeMap(() => {
        const updatedTaskRoot = this._findAndReplaceTicketTaskNode(
          tasksRoot,
          taskNode.id,
          taskNode,
        );
        return this.api.updateTicketTasks(ticketId, <TicketTaskGroup>updatedTaskRoot);
      }),
      tap((req) => {
        if (req.data) {
          this._ticketRequestsById[ticketId].next(req);
        }
      }),
    );
  }

  addComment(
    ticketId: string,
    comment: TicketActivityDetailsComment,
  ): Observable<DataRequest<Ticket>> {
    const ticket$ = this.getTicket(ticketId).pipe(
      filter((req) => req.data !== undefined),
      map((req) => req.data as Ticket),
    );

    const currentUser$ = this.usersService.currentUser;

    return combineLatest([ticket$, currentUser$]).pipe(
      map(([ticket, user]) => {
        const activityItem: TicketActivityItem = {
          id: Date.now().toString(),
          userId: user.id,
          timestamp: DataAdapter.modelToDtoTimestamp(new Date()),
          type: TicketActivityType.AddedComment,
          details: comment,
        };

        return [...ticket.activityLog, activityItem];
      }),
      mergeMap((activityItems) =>
        this.api
          .updateTicketActivity(ticketId, activityItems)
          .pipe(filter((req) => req.data !== undefined)),
      ),
      mergeMap(() => this.api.fetchTicket(ticketId)),
    );
  }

  createOrUpdateTicket(ticket: Ticket) {
    const ticketId = ticket.id;

    if (ticketId) {
      return this.api.updateTicket(ticket).pipe(
        tap((req) => {
          if (req.data) {
            this._dataNeedsRefresh$.next();
          }
        }),
        // mergeMap(() => this.getTicket(ticketId, true))
      );
    }

    return this.usersService.currentUser.pipe(
      switchMap((currentUser: MockUser) => {
        return this.api
          .createTicket({
            ...ticket,
            createdBy: {
              userId: currentUser.id,
              timestamp: new Date(),
            },
          })
          .pipe(
            tap((req) => {
              if (req.data) {
                this._dataNeedsRefresh$.next();
              }
            }),
          );
      }),
    );
  }

  deleteTicket(ticketId: string) {
    return this.api.deleteTicket(ticketId).pipe(
      tap((req) => {
        if (req.data) {
          this._dataNeedsRefresh$.next();
        }
      }),
    );
  }

  private _findAndReplaceTicketTaskNode(
    root: TicketTaskNode,
    id: string,
    newNode: TicketTaskNode,
  ): TicketTaskNode {
    if (root.id === id) {
      return {
        ...newNode,
      };
    }

    if (root.isLeaf) {
      return root;
    }

    const result = {
      ...root,
      children: root.children.map((child) =>
        this._findAndReplaceTicketTaskNode(child, id, newNode),
      ),
    };

    if (!result.children.find((node) => node.status !== 'done' && node.status !== 'approved')) {
      result.status = 'done';
    }

    return result;
  }

  private _findTicketTaskNode(root: TicketTaskNode, id: string): TicketTaskNode | undefined {
    if (root.id === id) {
      return root;
    }

    if (root.isLeaf) {
      return undefined;
    }

    return root.children
      .map((child) => this._findTicketTaskNode(child, id))
      .find((node) => node !== undefined);
  }
}
