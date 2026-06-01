import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { Plant } from '../../../data/models';
import { PageRoutingService } from '../../../shared/page-routing.service';

@Component({
  selector: 'app-inverter-control-page',
  templateUrl: './inverter-control-page.component.html',
  styleUrls: ['./inverter-control-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class InverterControlPageComponent {
  activeRoute = '';

  plant$: Observable<Plant>;

  constructor(pageRouting: PageRoutingService) {
    this.plant$ = pageRouting.getPlantFromQueryParams();
  }

  onRouteChange(route: string, active: any) {
    if (active) {
      this.activeRoute = route;
    }
  }
}
