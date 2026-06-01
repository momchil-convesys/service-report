import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { DeviceState, ErrorStackIndexValue } from '../../constants';
import { DeviceStateModule } from '../device-state/device-state.module';

@Component({
  selector: 'app-error-stack-index-value',
  templateUrl: './error-stack-index-value.component.html',
  styleUrls: ['./error-stack-index-value.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzIconModule, DeviceStateModule],
})
export class ErrorStackIndexValueComponent {
  @Input() value: ErrorStackIndexValue = ErrorStackIndexValue.NotAvailable;

  ErrorStackIndexValue = ErrorStackIndexValue;
  DeviceState = DeviceState;
}
