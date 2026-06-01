import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzResultModule } from 'ng-zorro-antd/result';

@Component({
  selector: 'app-not-authorized',
  imports: [NzButtonModule, NzResultModule, RouterModule],
  templateUrl: './not-authorized.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotAuthorizedComponent {
  constructor(private _location: Location) {}

  onClickBack() {
    this._location.back();
  }
}
