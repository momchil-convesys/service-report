import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { BaseWidget, NgCompInputs } from 'gridstack/dist/angular';
import { CustomDashboardsService } from '../custom-dashboards.service';

@Component({
  selector: 'app-custom-widget-configurator',
  templateUrl: './custom-widget-configurator.component.html',
  styleUrls: ['./custom-widget-configurator.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CustomWidgetConfiguratorComponent extends BaseWidget implements OnChanges, OnInit {
  @Input() widgetId: string | undefined;

  constructor(private dashboardsService: CustomDashboardsService) {
    super();

    console.log(this.constructor.name, '| constructor');
  }

  public override serialize(): NgCompInputs | undefined {
    return this.widgetId ? { text: this.widgetId } : undefined;
  }

  ngOnInit() {
    console.log(this.constructor.name, '| ngOnInit', this.widgetId);

    /**
     * Called once, after the first ngOnChanges().
     * ngOnInit() is still called even when ngOnChanges() is not (which is the case when there are no template-bound inputs).
     */
  }

  ngOnChanges() {
    console.log(this.constructor.name, '| ngOnChanges', this.widgetId);

    /**
     * ngOnInit() is still called even when ngOnChanges() is not (which is the case when there are no template-bound inputs).
     */
  }

  onDelete() {
    // TODO: confirmation
    this.dashboardsService.deleteWidget$.next(this.widgetId || '');
  }
}
