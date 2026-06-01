import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {
  inverterControlCommandStatusLabels,
  InverterControlRequest,
} from '../../_data/inverter-control.model';

@Component({
  selector: 'app-inverter-control-commands-status',
  templateUrl: './inverter-control-commands-status.component.html',
  styleUrls: ['./inverter-control-commands-status.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class InverterControlCommandsStatusComponent {
  @Input() requestItem: InverterControlRequest | undefined;
  @Input() loading: boolean = false;

  @Output() refreshStatus = new EventEmitter<{ requestItemId: string; event: MouseEvent }>();

  inverterControlCommandStatusLabels = inverterControlCommandStatusLabels;

  onRefresh(requestItemId: string, event: MouseEvent) {
    this.refreshStatus.next({ requestItemId, event });
  }

  hasPendingCommands(inverterControlRequest: InverterControlRequest): boolean {
    return (
      inverterControlRequest.commandsStatus.filter((command) => command.status === 'pending')
        .length > 0
    );
  }
}
