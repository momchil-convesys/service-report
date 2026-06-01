import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { CurrentFaults } from '../../constants';
import { FaultDefinition } from '../../data/models';
import { FaultTemplatesService } from '../../data/services/fault-templates.service';

@Component({
  selector: 'app-device-current-errors',
  templateUrl: './device-current-errors.component.html',
  styleUrls: ['./device-current-errors.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DeviceCurrentErrorsComponent {
  @Input() currentFaults: CurrentFaults | undefined;

  constructor(private faultTemplatesService: FaultTemplatesService) {}

  faultById(id: string): Observable<FaultDefinition | undefined> {
    return this.faultTemplatesService.getFaultDefinitionById(id);
  }
}
