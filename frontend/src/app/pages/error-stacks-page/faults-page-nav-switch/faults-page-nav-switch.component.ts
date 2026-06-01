import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-faults-page-nav-switch',
  templateUrl: './faults-page-nav-switch.component.html',
  styleUrls: ['./faults-page-nav-switch.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class FaultsPageNavSwitchComponent {
  activeOption: string | undefined;

  onRouterLinkActive(event: any) {
    this.activeOption = event;
  }
}
