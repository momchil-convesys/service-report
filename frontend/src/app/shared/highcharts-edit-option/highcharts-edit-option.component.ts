import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ChartOptionsGuiComponent } from '../../features/chart-options-gui/chart-options-gui.component';

@Component({
  selector: 'app-highcharts-edit-option',
  imports: [NzButtonModule, NzDrawerModule, NzIconModule, ChartOptionsGuiComponent],
  templateUrl: './highcharts-edit-option.component.html',
  styleUrl: './highcharts-edit-option.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HighchartsEditOptionComponent {
  @Input({ required: true }) chart: Highcharts.Chart | undefined;

  constructor(private cdr: ChangeDetectorRef) {}

  visible = false;

  open(): void {
    this.visible = true;
    this.cdr.detectChanges();
  }

  close(): void {
    this.visible = false;
    this.cdr.detectChanges();
  }
}
