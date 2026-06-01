import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { TravellingEntry } from '../models';

@Component({
  selector: 'app-travelling-entry-view',
  templateUrl: './travelling-entry-view.component.html',
  styleUrls: ['./travelling-entry-view.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TravellingEntryViewComponent implements OnChanges {
  @Input() entry!: TravellingEntry;

  sameDate = false;
  originDate!: Date;
  destinationDate!: Date;

  durationHours!: number;
  durationMinutes!: number;
  // this.entry.duratin not present in data - calculate  instead
  ngOnChanges() {
    if (this.entry) {
      this.originDate = new Date(this.entry.origin.timestamp);
      this.destinationDate = new Date(this.entry.destination.timestamp);
      this.sameDate = this.originDate.toDateString() === this.destinationDate.toDateString();

      //duration in minutes
      const duration: number =
        this.destinationDate.getTime() / 60000 - this.originDate.getTime() / 60000;

      this.entry.duration = duration;
      this.durationHours = Math.trunc(duration / 60);

      this.durationMinutes = duration % 60;
    }
  }
}
