import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { GridStack, GridStackNode, GridStackWidget } from 'gridstack';
import { GridstackComponent, NgGridStackOptions, NgGridStackWidget } from 'gridstack/dist/angular';
import { BehaviorSubject, Subject, auditTime, takeUntil } from 'rxjs';
import { TypedChange } from '../../../constants';
import { CustomDashboardConfig, CustomDashboardsService } from '../custom-dashboards.service';

const commonGridStackWidgetOptions: NgGridStackWidget = {
  minW: 4,
  minH: 2,
  w: 6,
  h: 3,
};

const defaultGridStackOptions: NgGridStackOptions = {
  alwaysShowResizeHandle: true,
  margin: 2,
  disableResize: true,
  disableDrag: true,
  // cellHeight: 'initial',
  resizable: {
    autoHide: false,
    handles: 'e,se,s,sw,w',
  },
  draggable: {
    scroll: true,
  },
  children: [],
};

interface ComponentChanges extends SimpleChanges {
  dashboardConfig: TypedChange<CustomDashboardConfig | null>;
  loading: TypedChange<boolean>;
}

@Component({
  selector: 'app-custom-dashboard',
  templateUrl: './custom-dashboard.component.html',
  styleUrls: ['./custom-dashboard.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CustomDashboardComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() dashboardConfig: CustomDashboardConfig | null = null;

  @Output() save = new EventEmitter<CustomDashboardConfig>();
  @Output() delete = new EventEmitter<string>();

  @ViewChildren('gridstackRef', { read: GridstackComponent }) gridStackComponents:
    | QueryList<GridstackComponent>
    | undefined;

  gridStack: GridStack | undefined;

  gridNodes: GridStackNode[] = [];

  gridOptions: NgGridStackOptions = defaultGridStackOptions;

  editMode$ = new BehaviorSubject(false);

  private _changes$ = new Subject<CustomDashboardConfig>();
  private _destroy$ = new Subject<void>();

  constructor(
    private dashboardsService: CustomDashboardsService,
    private cd: ChangeDetectorRef,
  ) {
    this.editMode$
      .pipe(takeUntil(this._destroy$))
      .subscribe((editMode) => this._setGridEditMode(editMode));

    this.dashboardsService.deleteWidget$.pipe(takeUntil(this._destroy$)).subscribe((widgetId) => {
      const widgetToRemove: GridStackNode | undefined = this.gridNodes.find(
        (node) => node.id === widgetId,
      );

      if (widgetToRemove && widgetToRemove.el) {
        this.gridStack?.removeWidget(widgetToRemove.el);
      }
    });

    this._changes$
      .pipe(takeUntil(this._destroy$))
      .pipe(auditTime(500)) // Take the last value from the silenced time window
      .subscribe((dashboardConfig) => {
        console.log(this.constructor.name, '|', 'Saving changes');
        this.save.next(dashboardConfig);
      });
  }

  ngAfterViewInit(): void {
    this.gridStack = this.gridStackComponents?.get(0)?.grid;

    this._setGridEditMode(false);
    this._attachEventHandlers();

    this._loadDashboardConfig(this.dashboardConfig);
  }

  ngOnChanges(changes: ComponentChanges) {
    console.log(this.constructor.name, '| ngOnChanges:', changes);

    // ngOnChanges is called also when a widget is added or removed,
    // but the change is already synced ad it is triggered by this very component.
    // TODO: refactor with a better component reuse logic
    if (changes.dashboardConfig.currentValue?.id !== changes.dashboardConfig.previousValue?.id) {
      this.editMode$.next(false);
      this._loadDashboardConfig(this.dashboardConfig);
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this.gridStack?.destroy();
  }

  onDeleteDashboard() {
    if (this.dashboardConfig) {
      this.delete.next(this.dashboardConfig.id);
    }
  }

  onEditLayout() {
    this.editMode$.next(true);
  }

  onDoneEditingLayout() {
    this.editMode$.next(false);
  }

  onAddWidget() {
    const widget: NgGridStackWidget = this._createNgWidget();
    this.gridStack?.addWidget(widget);
  }

  private _loadDashboardConfig(dashboard: CustomDashboardConfig | null) {
    if (!dashboard) {
      return;
    }

    // Disable animation for initial load
    this.gridStack?.setAnimation(false);

    this.gridStack?.load(dashboard.widgets.map((widget) => this._createNgWidget(widget)));

    this.gridStack?.setAnimation(true);
  }

  private _setGridEditMode(editMode: boolean) {
    this.gridStack?.enableResize(editMode);
    this.gridStack?.enableMove(editMode);
  }

  private _attachEventHandlers() {
    this.gridStack?.on('change', (event: Event, items: GridStackNode[]) => {
      console.log(this.constructor.name, '| ON event | CHANGE');

      // Keep latest version of moved or resized items
      items.forEach((item) => {
        const index = this.gridNodes.findIndex((node) => node.id === item.id);
        if (index >= 0) {
          this.gridNodes[index] = item;
        }
      });

      if (this.editMode$.getValue()) {
        // Do not save change on initial load
        this._handleChanges();
      }
    });

    this.gridStack?.on('added', (event: Event, items: GridStackNode[]) => {
      console.log(
        this.constructor.name,
        '| ON event | ADDED | Initial load: ',
        !this.editMode$.getValue(),
      );

      this.gridNodes = [...this.gridNodes, ...items];

      if (this.editMode$.getValue()) {
        // Scroll to item and save changes only if in edit mode and not on initial load
        const addedItem = items[0];
        if (addedItem) {
          addedItem.el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        this._handleChanges();
      } else {
        // Initial load
        this.cd.detectChanges();
      }
    });

    this.gridStack?.on('removed', (event: Event, items: GridStackNode[]) => {
      console.log(this.constructor.name, '| ON event | REMOVED');

      const removedItem = items[0];
      if (removedItem) {
        this.gridNodes = this.gridNodes.filter((node) => node.id !== removedItem.id);
      }

      if (this.editMode$.getValue()) {
        // Do not save change on initial load
        this._handleChanges();
      }
    });
  }

  private _handleChanges() {
    if (!this.dashboardConfig) {
      return;
    }

    const widgets = (this.gridStack?.save(false) || []) as GridStackWidget[];
    this._changes$.next({
      ...this.dashboardConfig,
      widgets,
    });
  }

  private _createNgWidget(source?: GridStackWidget): NgGridStackWidget {
    const selector = 'app-custom-widget-configurator';

    if (source) {
      return {
        ...source,
        selector,
        input: {
          widgetId: source.id,
        },
      };
    }

    const widgetId = this.dashboardsService.getNewId();

    const result: NgGridStackWidget = {
      ...commonGridStackWidgetOptions,
      id: widgetId,
      selector,
      input: {
        widgetId,
      },
    };

    return result;
  }
}
