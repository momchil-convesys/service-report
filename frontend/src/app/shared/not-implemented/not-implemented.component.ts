import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { NzResultModule } from 'ng-zorro-antd/result';

@Component({
  selector: 'app-not-implemented',
  imports: [NzResultModule],
  templateUrl: './not-implemented.component.html',
  styleUrl: './not-implemented.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotImplementedComponent {}
