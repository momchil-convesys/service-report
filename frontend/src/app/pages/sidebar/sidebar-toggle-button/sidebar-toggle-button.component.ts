import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { ResponsiveSidebarService } from '../responsive-sidebar.service';

@Component({
  selector: 'app-sidebar-toggle-button',
  templateUrl: './sidebar-toggle-button.component.html',
  styleUrls: ['./sidebar-toggle-button.component.less'],
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule, NzTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SidebarToggleButtonComponent {
  sidebarService = inject(ResponsiveSidebarService);

  showPlantsText = $localize`Show all plants`;
  hidePlantsText = $localize`Hide plants`;
}
