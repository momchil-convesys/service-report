import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorStacksService } from '../error-stacks.service';

@Component({
  selector: 'app-error-stack-list',
  templateUrl: './error-stack-list.component.html',
  styleUrls: ['./error-stack-list.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ErrorStackListComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public es: ErrorStacksService,
  ) {}

  onPageIndexChange(index: number) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pageIndex: index },
      queryParamsHandling: 'merge', // this will keep deviceSide param
    });
  }

  onDeviceSideFilterChange(value: string) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { deviceSide: value },
    });
  }
}
