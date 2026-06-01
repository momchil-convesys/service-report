import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { IsActiveMatchOptions, RouterModule } from '@angular/router';

@Component({
  selector: 'app-epm-measurement-level-nav',
  imports: [RouterModule],
  templateUrl: './epm-measurement-level-nav.component.html',
  styleUrl: './epm-measurement-level-nav.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpmMeasurementLevelNavComponent {
  @Input({ required: true }) subLevels: Array<{ subLevelId: string; name: string }> = [];

  matchSubLevelLinkOptions: IsActiveMatchOptions = {
    matrixParams: 'ignored',
    queryParams: 'exact',
    paths: 'exact',
    fragment: 'ignored',
  };
}
