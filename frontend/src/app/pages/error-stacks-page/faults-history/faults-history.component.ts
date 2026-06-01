import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrentFaults, DeviceType, PredefinedTimeRange } from '../../../constants';
import { PlantsService } from '../../../data/services/plants.service';
import { ErrorStack } from '../_data/error-stack.model';
import { ErrorStacksService } from '../error-stacks.service';

@Component({
  selector: 'app-faults-history',
  templateUrl: './faults-history.component.html',
  styleUrls: ['./faults-history.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class FaultsHistoryComponent {
  currentFaultsOnly = $localize`Current faults only`;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private plantsService: PlantsService,
    public es: ErrorStacksService,
  ) {}

  onPageIndexChange(index: number) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pageIndex: index },
      queryParamsHandling: 'merge',
    });
  }

  onTimeRangeChange(range: Date[]) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { from: range[0].toISOString(), to: range[1].toISOString() },
      queryParamsHandling: null,
    });
  }

  onPredefinedTimeRangeChange(predefinedRange: PredefinedTimeRange | undefined) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { predefinedRange },
      queryParamsHandling: null,
    });
  }

  constructCurrentFaultsModel(errorStack: ErrorStack): CurrentFaults {
    return {
      errorStackId: errorStack.id,
      values: [...errorStack.summary],
    };
  }

  hasErrorStack(deviceId: string): boolean {
    return this.plantsService.getCachedDeviceById(deviceId)?.type !== DeviceType.BatteryString;
  }
}
