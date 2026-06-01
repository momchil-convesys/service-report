import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-nav-up',
  imports: [RouterModule, NzButtonModule, NzIconModule],
  templateUrl: './nav-up.component.html',
  styleUrls: ['./nav-up.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavUpComponent {
  @Input() routerLink: string = './../';
  @Input() label: string = $localize`Back`;
}
