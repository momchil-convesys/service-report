import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, map, Observable, shareReplay, switchMap, tap } from 'rxjs';
import { PageRoutingService } from '../../../shared/page-routing.service';
import { ControlStateApiService } from '../../power-schedule/_data/control-state-api.service';
import { CurrentControlStateDTO } from '../../power-schedule/_data/control-state.dto';
import { ControlInterfaceComponent } from './control-interface/control-interface.component';

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [CommonModule, ControlInterfaceComponent],
  templateUrl: './control-panel.component.html',
  styleUrl: './control-panel.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ControlStateApiService],
})
export class ControlPanelComponent implements OnInit {
  private readonly pageRouting = inject(PageRoutingService);
  private readonly controlStateApi = inject(ControlStateApiService);

  plant$ = this.pageRouting.getPlantFromQueryParams();

  controlState$: Observable<CurrentControlStateDTO | null>;
  controlStateLoading$ = new BehaviorSubject<boolean>(false);

  constructor() {
    // Initialize control state observable
    this.controlState$ = this.plant$.pipe(
      switchMap((plant) => {
        this.controlStateLoading$.next(true);
        return this.controlStateApi.fetchCurrentControlState(plant.id);
      }),
      tap((request) => {
        this.controlStateLoading$.next(request.isLoading ?? false);
      }),
      map((request) => request.data ?? null),
      shareReplay(1),
      takeUntilDestroyed(),
    );
  }

  ngOnInit(): void {
    // Observable is initialized in constructor
  }
}
