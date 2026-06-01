import { SelectionModel } from '@angular/cdk/collections';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {
  NzTreeFlattener,
  NzTreeViewComponent,
  NzTreeViewFlatDataSource,
  NzTreeViewModule,
} from 'ng-zorro-antd/tree-view';
import { BESSDataService } from '../_data/data.service';
import { BESSAssetType } from '../_data/dto/assets/asset-base.dto';
import { BESSAssetDTO } from '../_data/dto/assets/asset.dto';
import { BESSConnectionDTO, BESSMetadataDTO } from '../_data/dto/bess.dto';

export interface BESSAssetTreeNode {
  asset: BESSAssetDTO;
  children?: BESSAssetTreeNode[];
}

interface BESSFlatNode {
  expandable: boolean;
  asset: BESSAssetDTO;
  level: number;
}

interface BESSTreeData {
  root: BESSAssetTreeNode;
  view?: NzTreeViewComponent<BESSFlatNode>;
  treeFlattener: NzTreeFlattener<BESSAssetTreeNode, BESSFlatNode>;
  dataSource: NzTreeViewFlatDataSource<BESSAssetTreeNode, BESSFlatNode>;
  selectListSelection: SelectionModel<BESSFlatNode>;
}

@Component({
  selector: 'app-bess-tree',
  imports: [NzButtonModule, NzIconModule, NzTreeViewModule],
  templateUrl: './bess-tree.component.html',
  styleUrl: './bess-tree.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BessTreeComponent implements OnInit {
  @ViewChildren('tv') treeViews!: QueryList<NzTreeViewComponent<BESSFlatNode>>;

  levelAccessor = (n: BESSFlatNode) => n.level;

  private cdr = inject(ChangeDetectorRef);

  private dataService = inject(BESSDataService);

  private _bessMetadata = this.dataService.getBESSMetadataFromCache();
  metadata: BESSMetadataDTO | undefined = this._bessMetadata;

  treeNodes: BESSAssetTreeNode[] = this._buildAssetTree(
    this.metadata?.assets ?? [],
    this.metadata?.topology ?? [],
  );

  trees: BESSTreeData[] = [];

  ngOnInit() {
    if (!this.metadata) {
      throw new Error('Bess metadata not found in cache');
    }

    this.trees = this.treeNodes.map((node) => this._buildTreeData(node));
  }

  ngAfterViewInit(): void {
    // Initial attach
    this._attachTreeViews();

    // If trees list can change later, keep them mapped
    this.treeViews.changes.subscribe(() => this._attachTreeViews());
  }

  private _attachTreeViews(): void {
    const views = this.treeViews.toArray();

    // Assumes DOM order == trees[] order (true with @for + track)
    this.trees.forEach((tree, i) => {
      const view = views[i];
      tree.view = view;

      // Recreate datasource now that we have the tree-view instance (v21 constructor)
      tree.dataSource = new NzTreeViewFlatDataSource<BESSAssetTreeNode, BESSFlatNode>(
        view,
        tree.treeFlattener,
        [],
      );

      // Only show children of root
      tree.dataSource.setData(tree.root.children || []);

      // Restore default expanded state (your old expandAll)
      view.expandAll();
    });

    this.cdr.markForCheck();
  }

  hasChild = (_: number, node: BESSFlatNode): boolean => node.expandable;

  isTransformerStation = (node: BESSAssetTreeNode): boolean =>
    node.asset.type === BESSAssetType.TransformerStation;

  shortenAssetName(asset: BESSAssetDTO): string {
    const parts = asset.name.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : asset.name;
  }

  getAssetTypeLabelShort(type: BESSAssetType): string {
    switch (type) {
      case BESSAssetType.BESSItself:
        return 'BESS';
      case BESSAssetType.TransformerStation:
        return 'TS';
      case BESSAssetType.BatteryContainer:
        return 'BC';
      case BESSAssetType.BatteryRack:
        return 'BR';
      case BESSAssetType.BatteryPack:
        return 'BP';
      case BESSAssetType.BatteryCell:
        return 'BCL';
      case BESSAssetType.Inverter:
        return 'INV';
      default:
        return 'UNK';
    }
  }

  getAssetTypeLabel(type: BESSAssetType): string {
    switch (type) {
      case BESSAssetType.BESSItself:
        return 'BESS Itself';
      case BESSAssetType.TransformerStation:
        return 'Transformer Station';
      case BESSAssetType.BatteryContainer:
        return 'Battery Container';
      case BESSAssetType.BatteryRack:
        return 'Battery Rack';
      case BESSAssetType.BatteryPack:
        return 'Battery Pack';
      case BESSAssetType.BatteryCell:
        return 'Battery Cell';
      case BESSAssetType.Inverter:
        return 'Inverter';
      default:
        return 'Unknown';
    }
  }

  expandAll(): void {
    this.trees.forEach((tree) => {
      tree.view?.expandAll();
    });
    this.cdr.markForCheck();
  }

  collapseAll(): void {
    this.trees.forEach((tree) => {
      tree.view?.collapseAll();
    });
    this.cdr.markForCheck();
  }

  private _buildTreeData(node: BESSAssetTreeNode): BESSTreeData {
    const transformer = (n: BESSAssetTreeNode, level: number): BESSFlatNode => ({
      expandable: !!n.children && n.children.length > 0,
      asset: n.asset,
      level,
    });

    const treeFlattener = new NzTreeFlattener(
      transformer,
      (n) => n.level,
      (n) => n.expandable,
      (n) => n.children,
    );

    // temporary placeholder; real dataSource is created in _attachTreeViews()
    const dataSource = {} as NzTreeViewFlatDataSource<BESSAssetTreeNode, BESSFlatNode>;

    const selectListSelection = new SelectionModel<BESSFlatNode>(true);

    return {
      root: node,
      treeFlattener,
      dataSource,
      selectListSelection,
    };
  }

  private _findRoots(assets: BESSAssetDTO[], connections: BESSConnectionDTO[]) {
    // Create a set of BESS asset IDs to filter out connections from BESS
    const bessIds = new Set(
      assets.filter((a) => a.type === BESSAssetType.BESSItself).map((a) => a.id),
    );

    // Filter out connections involving BESS itself
    const filteredConnections = connections.filter((c) => !bessIds.has(c.fromAssetId));
    const toIds = new Set(filteredConnections.map((c) => c.toAssetId));
    return assets.filter((a) => !toIds.has(a.id) && a.type !== BESSAssetType.BESSItself);
  }

  private _buildAssetTree(
    assets: BESSAssetDTO[],
    connections: BESSConnectionDTO[],
  ): BESSAssetTreeNode[] {
    const map = new Map<string, BESSAssetTreeNode>();

    // Create a set of BESS asset IDs to filter out connections from BESS
    const bessIds = new Set(
      assets.filter((a) => a.type === BESSAssetType.BESSItself).map((a) => a.id),
    );

    // Create node map for all assets except BESS
    assets.forEach((asset) => {
      if (asset.type !== BESSAssetType.BESSItself) {
        map.set(asset.id, { asset: asset, children: [] });
      }
    });

    // Connect children (skip connections involving BESS)
    connections
      .filter((conn) => !bessIds.has(conn.fromAssetId))
      .forEach((conn) => {
        const parent = map.get(conn.fromAssetId);
        const child = map.get(conn.toAssetId);
        if (parent && child && parent.children) parent.children.push(child);
      });

    // Return only root nodes (excluding BESS)
    const roots = this._findRoots(assets, connections);
    return roots.map((r) => map.get(r.id)!);
  }
}
