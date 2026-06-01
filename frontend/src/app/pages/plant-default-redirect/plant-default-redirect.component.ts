import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { PageRoutingService } from '../../shared/page-routing.service';

@Component({
  selector: 'app-plant-default-redirect',
  standalone: true,
  template: '',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PageRoutingService],
})
export class PlantDefaultRedirectComponent implements OnInit {
  private pageRouting = inject(PageRoutingService);
  private router = inject(Router);

  ngOnInit(): void {
    this.pageRouting
      .getPlantFromQueryParams()
      .pipe(
        filter((plant) => plant !== undefined),
        take(1),
      )
      .subscribe((plant) => {
        const redirectPath = plant.plantSpecificMetadata?.bessId ? 'pv-bess-overview' : 'overview';
        this.router.navigate([redirectPath], { relativeTo: this.pageRouting.route });
      });
  }
}
