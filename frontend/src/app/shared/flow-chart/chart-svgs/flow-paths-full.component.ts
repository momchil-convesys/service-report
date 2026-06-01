import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FlowPathsBaseComponent } from './flow-paths-base.component';

@Component({
  selector: 'app-flow-paths-full',
  imports: [],
  templateUrl: './svg-templates/flow-paths-full.component.svg',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowPathsFullComponent extends FlowPathsBaseComponent {}
