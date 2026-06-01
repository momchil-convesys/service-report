import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { ReplaySubject, delay, take, tap } from 'rxjs';
import { TypedChange } from '../../../constants';
import { InverterControlRequest } from '../_data/inverter-control.model';
import { InverterControlService } from '../_data/inverter-control.service';

interface ComponentChanges extends SimpleChanges {
  item: TypedChange<InverterControlRequest | undefined>;
}

@Component({
  selector: 'app-inverter-control-request-item',
  templateUrl: './inverter-control-request-item.component.html',
  styleUrls: ['./inverter-control-request-item.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class InverterControlRequestItemComponent implements OnChanges {
  @Input() item: InverterControlRequest | undefined;

  error$: ReplaySubject<Error | undefined> = new ReplaySubject(1);
  isLoading$: ReplaySubject<boolean> = new ReplaySubject(1);
  item$: ReplaySubject<InverterControlRequest | undefined> = new ReplaySubject(1);

  constructor(private dataService: InverterControlService) {}

  ngOnChanges(changes: ComponentChanges): void {
    if (changes.item) {
      this.item$.next(changes.item.currentValue);
    }
  }

  onRefresh(data: { requestItemId: string; event: MouseEvent }) {
    const buttonElement: HTMLElement | undefined = data.event.currentTarget as HTMLElement;

    this.dataService
      .getInverterControlRequest(data.requestItemId)
      .pipe(
        tap((req) => {
          if (req.isLoading) {
            this.isLoading$.next(req.isLoading);
          }
        }),
        delay(700), // For smooth loading animation
        tap((req) => {
          if (!req.isLoading) {
            this.error$.next(req.error);
            this.isLoading$.next(req.isLoading);
            this.item$.next(req.data);
            buttonElement?.blur();
          }
        }),
        take(2),
      )
      .subscribe();
  }
}
