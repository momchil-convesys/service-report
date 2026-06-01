import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { Observable } from 'rxjs';
import { CustomDataViewsDataService } from '../_data/data.service';
import { CustomDataViewConfig } from '../_data/models';

@Component({
  selector: 'app-custom-data-views-side-nav',
  imports: [NzMenuModule, NzButtonModule, CommonModule, RouterModule],
  templateUrl: './custom-data-views-side-nav.component.html',
  styleUrl: './custom-data-views-side-nav.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomDataViewsSideNavComponent {
  customDataViews$: Observable<CustomDataViewConfig[]>;

  constructor(
    private dataService: CustomDataViewsDataService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.customDataViews$ = this.dataService.getCustomDataViews();
  }

  onCreateNewDataView() {
    const id = new Date().toISOString();

    this.dataService.saveCustomDataView({
      id,
      name: 'New data view',
      description: 'Description',
      dataSeriesConfigurations: [],
      chartOptions: undefined,
    });

    this.router.navigate([id], { relativeTo: this.route });
  }
}
