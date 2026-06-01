import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, shareReplay, switchMap } from 'rxjs';
import { CustomDataViewsDataService } from '../_data/data.service';
import { CustomDataViewConfig } from '../_data/models';
import { CustomDataViewComponent } from '../custom-data-view/custom-data-view.component';

@Component({
  selector: 'app-custom-data-view-loader',
  templateUrl: './custom-data-view-loader.component.html',
  styleUrls: ['./custom-data-view-loader.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CustomDataViewComponent, AsyncPipe],
})
export class CustomDataViewLoaderComponent {
  dataView$: Observable<CustomDataViewConfig | null>;

  constructor(
    private dataService: CustomDataViewsDataService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.dataView$ = this.route.paramMap.pipe(
      map((params) => params.get('dataViewId')),
      switchMap((dataViewId) => this.dataService.getCustomDataViewById(dataViewId || '')),
      shareReplay(1),
    );
  }

  onSave(dataViewConfig: CustomDataViewConfig) {
    this.dataService.saveCustomDataView(dataViewConfig);
  }

  onDeleteDataView(dataViewId: string) {
    this.dataService.deleteCustomDataView(dataViewId);
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
