import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { PlantsService } from '../../data/services/plants.service';

@Component({
  selector: 'app-no-plant-selected',
  imports: [],
  templateUrl: './no-plant-selected.component.html',
  styleUrl: './no-plant-selected.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoPlantSelectedComponent {
  constructor(
    private plantsService: PlantsService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.plantsService
      .getPlants()
      .pipe(
        filter((req) => req.isLoading === false),
        take(1),
      )
      .subscribe((req) => {
        if (req.data && req.data.length === 1) {
          this.router.navigate([req.data[0].id], { relativeTo: this.route });
        }
      });
  }
}
