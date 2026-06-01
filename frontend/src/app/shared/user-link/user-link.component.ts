import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { User } from 'src/app/data/models';
import { PlantsService } from 'src/app/data/services/plants.service';

@Component({
  selector: 'app-user-link[userId]',
  imports: [CommonModule],
  templateUrl: './user-link.component.html',
  styleUrls: ['./user-link.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserLinkComponent implements OnChanges {
  @Input({ required: true }) userId: string | undefined;

  _user$: BehaviorSubject<User | undefined> = new BehaviorSubject<User | undefined>(undefined);

  user$: Observable<User | undefined> = this._user$.pipe(shareReplay(1), takeUntilDestroyed());

  constructor(private plantsService: PlantsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    const user: User | undefined = this.plantsService.getCachedRelatedUserById(this.userId || '');

    this._user$.next(user);
  }
}
