import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { BehaviorSubject } from 'rxjs';
import { PriorityMode } from '../../power-schedule/_data/priority-modes.dto';
import { SystemMode, systemModes } from './system-modes';

@Component({
  selector: 'app-system-modes',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzDividerModule,
    NzButtonModule,
    NzRadioModule,
    NzIconModule,
    FormsModule,
  ],
  templateUrl: './system-modes.component.html',
  styleUrl: './system-modes.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemModesComponent {
  @Output() selectedMode = new EventEmitter<SystemMode | null>();

  selectedMode$: BehaviorSubject<SystemMode | null> = new BehaviorSubject<SystemMode | null>(null);
  selectedModeId: PriorityMode | null = null;
  showDescriptions = true;

  readonly systemModes: SystemMode[] = systemModes;

  constructor() {
    this.selectedMode$.subscribe((mode) => {
      this.selectedModeId = mode?.id ?? null;
      this.selectedMode.emit(mode);
    });
  }

  ngOnInit() {
    this.onClearMode();
  }

  onSelectMode(mode: SystemMode) {
    this.selectedMode$.next(mode);
  }

  onClearMode() {
    this.selectedMode$.next(null);
    this.selectedModeId = null;
  }

  onRadioChange(modeId: PriorityMode) {
    const mode = this.systemModes.find((m) => m.id === modeId);
    if (mode) {
      this.onSelectMode(mode);
    }
  }

  toggleDescriptions() {
    this.showDescriptions = !this.showDescriptions;
  }
}
