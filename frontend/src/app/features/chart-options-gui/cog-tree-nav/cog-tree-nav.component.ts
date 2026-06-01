import { SelectionModel } from '@angular/cdk/collections';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import {
  NzTreeFlattener,
  NzTreeViewComponent,
  NzTreeViewFlatDataSource,
  NzTreeViewModule,
} from 'ng-zorro-antd/tree-view';
import { ActionContext, toArray, xAxisOptionsDefault, yAxisOptionsDefault } from '../constants';

interface TreeNode {
  name: string;
  key: string;
  children?: TreeNode[];
  removable: boolean;
  selectionContext: ActionContext;
}

interface FlatNode {
  expandable: boolean;
  name: string;
  key: string;
  level: number;
  removable: boolean;
  selectionContext: ActionContext;
}

@Component({
  selector: 'app-cog-tree-nav',
  imports: [NzButtonModule, NzInputModule, NzIconModule, NzTreeViewModule],
  templateUrl: './cog-tree-nav.component.html',
  styleUrl: './cog-tree-nav.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CogTreeNavComponent {
  @Input({ required: true }) chart: Highcharts.Chart | undefined;

  @Output() selectionChange = new EventEmitter<ActionContext | undefined>();

  private transformer = (node: TreeNode, level: number): FlatNode => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.key === node.key
        ? existingNode
        : {
            expandable: !!node.children && node.children.length > 0,
            name: node.name,
            level,
            key: node.key,
            removable: node.removable,
            selectionContext: node.selectionContext,
          };
    flatNode.name = node.name;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  private idCounters = {
    xAxis: 0,
    yAxis: 0,
    series: 0,
  };

  treeData: TreeNode[] = [];
  flatNodeMap = new Map<FlatNode, TreeNode>();
  nestedNodeMap = new Map<TreeNode, FlatNode>();
  selectListSelection = new SelectionModel<FlatNode>(false);

  @ViewChild(NzTreeViewComponent, { static: true }) tree!: NzTreeViewComponent<FlatNode>;

  readonly levelAccessor = (dataNode: FlatNode): number => dataNode.level;

  treeFlattener = new NzTreeFlattener(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );

  dataSource!: NzTreeViewFlatDataSource<TreeNode, FlatNode>;

  constructor() {
    this.selectListSelection.changed.subscribe((x) => {
      this.selectionChange.next(x.added.length > 0 ? x.added[0].selectionContext : undefined);
    });
  }

  ngOnChanges() {
    this.idCounters = {
      xAxis: 0,
      yAxis: 0,
      series: 0,
    };

    this.treeData = this._constructTreeData(this.chart);
    this.dataSource?.setData(this.treeData);
    this.tree.expandAll();
  }

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;
  hasNoContent = (_: number, node: FlatNode): boolean => node.name === '';

  ngOnInit(): void {
    if (this.tree) {
      this.dataSource = new NzTreeViewFlatDataSource(this.tree, this.treeFlattener);
    }
  }

  ngAfterViewInit(): void {
    if (this.tree) {
      this.treeData = this._constructTreeData(this.chart);
      this.dataSource?.setData(this.treeData);
      this.tree.expandAll();
    }
  }

  delete(node: FlatNode): void {
    const chart = this.chart;

    if (!chart) {
      return;
    }

    switch (node.selectionContext?.section) {
      case 'yAxis': {
        const axis = chart.yAxis.find((x) => x.options.id === node.selectionContext.objectId);
        axis?.remove();
        break;
      }

      case 'xAxis': {
        const axis = chart.xAxis.find((x) => x.options.id === node.selectionContext.objectId);
        axis?.remove();
        break;
      }

      case 'series': {
        const object = chart.series.find((x) => x.options.id === node.selectionContext.objectId);
        object?.remove();
        break;
      }
    }

    if (this.selectListSelection.isSelected(node)) {
      this.selectionChange.next(undefined);
    }

    const originNode = this.flatNodeMap.get(node);

    const dfsParentNode = (): TreeNode | null => {
      const stack = [...this.treeData];
      while (stack.length > 0) {
        const n = stack.pop()!;
        if (n.children) {
          if (n.children.find((e) => e === originNode)) {
            return n;
          }

          for (let i = n.children.length - 1; i >= 0; i--) {
            stack.push(n.children[i]);
          }
        }
      }
      return null;
    };

    const parentNode = dfsParentNode();
    if (parentNode && parentNode.children) {
      parentNode.children = parentNode.children.filter((e) => e !== originNode);
    }

    this.dataSource?.setData(this.treeData);
  }

  addNewNode(node: FlatNode): void {
    const chart = this.chart;

    if (!chart) {
      return;
    }

    const parentNode = this.flatNodeMap.get(node);
    if (!parentNode) {
      return;
    }

    parentNode.children = parentNode.children || [];

    let key = `${parentNode.key}-`;
    let name = '';

    switch (node.selectionContext?.section) {
      case 'yAxis': {
        const index = this.idCounters.yAxis;

        key += `${index}`;
        name = `Y axis ${index}`;

        this.idCounters.yAxis += 1;

        chart.addAxis({
          ...yAxisOptionsDefault,
          id: key,
        });

        break;
      }

      case 'xAxis': {
        const index = this.idCounters.xAxis;

        key += `${index}`;
        name = `X axis ${index}`;

        this.idCounters.xAxis += 1;

        chart.addAxis(
          {
            ...xAxisOptionsDefault,
            id: key,
          },
          true,
        );

        break;
      }

      case 'series': {
        const index = this.idCounters.series;

        key += `${index}`;
        name = `Series ${index}`;

        this.idCounters.series += 1;

        chart.addSeries({
          type: 'line',
          id: key,
          name: name,
        });

        break;
      }
    }

    const newNode: TreeNode = {
      name: name,
      key: key,
      removable: true,
      selectionContext: {
        section: parentNode.selectionContext.section,
        objectId: key,
      },
    };

    parentNode.children.push(newNode);

    this.dataSource?.setData(this.treeData);
    this.tree.expand(node);

    const flatNode: FlatNode | undefined = this.nestedNodeMap.get(newNode);
    if (flatNode) {
      this.selectListSelection.toggle(flatNode);
    }
  }

  saveNode(node: FlatNode, value: string): void {
    const nestedNode = this.flatNodeMap.get(node);
    if (nestedNode) {
      nestedNode.name = value;
      this.dataSource?.setData(this.treeData);
    }
  }

  private _constructTreeData(chart: Highcharts.Chart | undefined): TreeNode[] {
    const yAxisArray: Highcharts.Axis[] = toArray(chart?.yAxis);
    const xAxisArray: Highcharts.Axis[] = toArray(chart?.xAxis);
    const seriesArray: Highcharts.Series[] = toArray(chart?.series);

    let result: TreeNode[] = [
      {
        name: 'Plot options',
        key: 'plotOptions',
        removable: false,
        selectionContext: {
          section: 'plotOptions',
          objectId: 'plotOptions',
        },
      },
      {
        name: 'Y axes',
        key: 'yAxis',
        removable: false,
        selectionContext: {
          section: 'yAxis',
          objectId: 'yAxis',
        },
        children: yAxisArray.map((a) => {
          const index = this.idCounters.yAxis;
          this.idCounters.yAxis += 1;

          let objectId = a.options.id;
          if (!objectId) {
            objectId = `yAxis-${index}`;
            a.update({ id: objectId });
          }

          return {
            key: `yAxis-${index}`,
            name: `Y axis ${index}`,
            removable: true,
            selectionContext: {
              section: 'yAxis',
              objectId,
            },
          };
        }),
      },
      {
        name: 'X axes',
        key: 'xAxis',
        removable: false,
        selectionContext: {
          section: 'xAxis',
          objectId: `xAxis`,
        },
        children: xAxisArray.map((a) => {
          const index = this.idCounters.xAxis;
          this.idCounters.xAxis += 1;

          let objectId = a.options.id;
          if (!objectId) {
            objectId = `xAxis-${index}`;
            a.update({ id: objectId });
          }

          return {
            key: `xAxis-${index}`,
            name: `X axis ${index}`,
            removable: true,
            selectionContext: {
              section: 'xAxis',
              objectId,
            },
          };
        }),
      },
      {
        name: 'Series',
        key: 'series',
        removable: false,
        selectionContext: {
          section: 'series',
          objectId: `series`,
        },
        children: seriesArray.map((s) => {
          const index = this.idCounters.series;
          this.idCounters.series += 1;

          let objectId = s.options.id;
          if (!objectId) {
            objectId = `series-${index}`;
            // TODO: fix type cast
            s.update({ type: s.options.type as any, id: objectId });
          }

          return {
            key: `series-${index}`,
            name: `Series ${index}`,
            removable: true,
            selectionContext: {
              section: 'series',
              objectId,
            },
          };
        }),
      },
    ];

    return result;
  }
}
