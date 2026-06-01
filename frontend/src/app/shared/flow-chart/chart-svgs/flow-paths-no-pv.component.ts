import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FlowPathsBaseComponent } from './flow-paths-base.component';

@Component({
  selector: 'app-flow-paths-no-pv',
  imports: [],
  templateUrl: './svg-templates/flow-paths-no-pv.component.svg',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowPathsNoPvComponent extends FlowPathsBaseComponent {}
