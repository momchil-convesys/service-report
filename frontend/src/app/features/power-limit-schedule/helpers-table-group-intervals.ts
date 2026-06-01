import { getHours } from 'date-fns';

export interface TableRowBase {
  interval: Interval;
}

export interface TableRowGroupBase<T extends TableRowBase> {
  interval: Interval;

  tableRows: T[];
}

export interface TableTreeNode<T extends TableRowBase, G extends TableRowGroupBase<T>> {
  key: string;

  expand?: boolean;
  level?: number;
  parent?: TableTreeNode<T, G>;
  children?: TableTreeNode<T, G>[];

  // Hour intervals
  hourIntervalData?: G;

  // 15 min sub intervals
  subIntervalData?: T;
}

/**
 * If the provided group is a more complex object,
 * a factory function should be provided.
 * Otherwise a default factory is used,
 * which only knows about the properties in TableRowGroupBase.
 */
export function groupTableRowsByHour<T extends TableRowBase, G extends TableRowGroupBase<T>>(
  rows: T[],
  createGroup: (interval: Interval, tableRows: T[]) => G = (interval, tableRows) =>
    ({
      interval,
      tableRows,
    }) as G,
): G[] {
  const tableRowsMap: Record<number, T[]> = groupByHour(rows);

  const groupedTableRows: T[][] = Object.values(tableRowsMap);

  const result: G[] = [];

  groupedTableRows.forEach((tableRowsInGroup) => {
    if (tableRowsInGroup.length === 0) {
      return;
    }

    const firstSubInterval = tableRowsInGroup[0].interval;
    const lastSubInterval = tableRowsInGroup[tableRowsInGroup.length - 1].interval;

    const group = createGroup(
      {
        start: firstSubInterval.start,
        end: lastSubInterval.end,
      },
      tableRowsInGroup,
    );

    result.push(group);
  });

  return result;
}

function groupByHour<T extends TableRowBase>(rows: T[]): Record<number, T[]> {
  return rows.reduce((groups: Record<number, T[]>, row: T) => {
    const hour = getHours(row.interval.start); // Extract the hour from start time

    if (!groups[hour]) {
      groups[hour] = []; // Initialize if this hour doesn't exist in the group yet
    }

    groups[hour].push(row); // Add row to the corresponding hour group

    return groups;
  }, {}); // Initial empty grouping object
}

export function convertGroupsTreeNodes<T extends TableRowBase, G extends TableRowGroupBase<T>>(
  groups: G[] | undefined,
): TableTreeNode<T, G>[] {
  const result: TableTreeNode<T, G>[] = (groups || []).map((tableRowGroup) => ({
    key: 'groupKey' + tableRowGroup.interval.start.toString(),
    hourIntervalData: tableRowGroup,
    children: tableRowGroup.tableRows.map((tableRow) => ({
      key: 'childKey' + tableRow.interval.start,
      subIntervalData: tableRow,
    })),
  }));

  return result;
}

export function convertTreeToList<T extends TableRowBase, G extends TableRowGroupBase<T>>(
  root: TableTreeNode<T, G>,
  expandedNodeKeys: string[],
): TableTreeNode<T, G>[] {
  const stack: TableTreeNode<T, G>[] = [];
  const array: TableTreeNode<T, G>[] = [];
  const hashMap = {};

  const isExpanded = expandedNodeKeys.indexOf(root.key) >= 0;
  stack.push({ ...root, level: 0, expand: isExpanded });

  while (stack.length !== 0) {
    const node = stack.pop()!;

    visitNode(node, hashMap, array);
    if (node.children) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push({
          ...node.children[i],
          level: node.level! + 1,
          expand: true,
          parent: node,
        });
      }
    }
  }

  return array;
}

function visitNode<T extends TableRowBase, G extends TableRowGroupBase<T>>(
  node: TableTreeNode<T, G>,
  hashMap: { [key: string]: boolean },
  array: TableTreeNode<T, G>[],
): void {
  if (!hashMap[node.key]) {
    hashMap[node.key] = true;
    array.push(node);
  }
}

export function collapseTableTreeTreeNode<T extends TableRowBase, G extends TableRowGroupBase<T>>(
  array: TableTreeNode<T, G>[],
  data: TableTreeNode<T, G>,
  event: boolean,
) {
  if (!event) {
    if (data.children) {
      data.children.forEach((d) => {
        const target = array.find((a) => a.key === d.key)!;
        target.expand = false;
        collapseTableTreeTreeNode(array, target, false);
      });
    } else {
      return;
    }
  }
}
