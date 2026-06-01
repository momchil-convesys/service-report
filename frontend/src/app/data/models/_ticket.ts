import { TaskNodeDefinition } from './_tasks';

export type TaskStatus = 'pending' | 'in-progress' | 'done';

export const taskStatusLabels: {
  [key in TaskStatus]: string;
} = {
  done: 'Done',
  pending: 'Pending',
  'in-progress': 'In Progress',
};

export type TaskGroupStatus = 'not-started' | 'in-progress' | 'done' | 'approved';

export const taskGroupStatusLabels: {
  [key in TaskGroupStatus]: string;
} = {
  'not-started': 'Not started',
  'in-progress': 'In Progress',
  done: 'Done',
  approved: 'Approved',
};

export enum TicketActivityType {
  AddedComment = 'cmmnt',
  TaskStatusChanged = 'tsk',
  TaskGroupEdited = 'tsk-grp-edit',
  Created = 'crtd',
  Assigned = 'assgn',
  Solved = 'slvd',
}

export interface TicketActivityDetailsComment {
  message: string;
}

export interface TicketActivityDetailsTaskStatusChange {
  taskName: string;
  status: TaskStatus;
}

export interface TicketActivityDetailsTaskGroupEdit {
  taskGroupName: string;
  assignedTo: string;
  status: TaskGroupStatus;
}

export type TicketActivityDetailsType =
  | TicketActivityDetailsComment
  | TicketActivityDetailsTaskStatusChange
  | TicketActivityDetailsTaskGroupEdit;

export interface TicketActivityItem {
  id: string;
  userId: string; // or null for System?
  timestamp: string;
  type: TicketActivityType;
  details: TicketActivityDetailsType;
}

export interface TicketTask {
  id: string;
  taskNodeDefinition: TaskNodeDefinition;
  isLeaf: true;
  enabled: boolean;
  index: number | undefined; // Index in parent node for ordered groups

  status: TaskStatus;
  outcome: string;
}

export interface TicketTaskGroup {
  id: string;
  taskNodeDefinition: TaskNodeDefinition;
  isLeaf: false;
  enabled: boolean;
  index: number | undefined; // Index in parent node for ordered groups

  status: TaskGroupStatus;
  assignedTo: string | null;
  children: (TicketTask | TicketTaskGroup)[];
}

export type TicketTaskNode = TicketTask | TicketTaskGroup;

export interface Ticket {
  id?: string;
  title: string;
  description: string;
  createdBy?: {
    userId: string; // or null for System?
    timestamp: Date;
  };
  assignedTo: string | null; // user ID or null of not assigned
  activityLog: TicketActivityItem[];
  tasksRoot: TicketTaskGroup | null;
}

export interface TicketDTO {
  title: string;
  description: string;
  createdBy?: {
    userId: string; // or null for System?
    timestamp: string;
  };
  assignedTo: string | null; // user ID or null of not assigned
  activityLog: TicketActivityItem[];
  tasksRoot: TicketTaskGroup | null;
}
