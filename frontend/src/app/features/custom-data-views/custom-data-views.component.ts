import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomDataViewsSideNavComponent } from './custom-data-views-side-nav/custom-data-views-side-nav.component';

@Component({
  selector: 'app-custom-data-views',
  imports: [CustomDataViewsSideNavComponent, RouterModule],
  templateUrl: './custom-data-views.component.html',
  styleUrl: './custom-data-views.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomDataViewsComponent {}
