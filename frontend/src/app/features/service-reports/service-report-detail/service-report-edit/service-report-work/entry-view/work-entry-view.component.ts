import { Component, Input, OnChanges } from '@angular/core';
import { WorkEntry } from '../models';

@Component({
  selector: 'app-works-entry-view',
  templateUrl: './work-entry-view.component.html',
  styleUrls: ['./work-entry-view.component.less'],
  standalone: false,
})
export class WorkEntryViewComponent implements OnChanges {
  @Input() entry!: WorkEntry;

  timeWorkStart!: Date;
  timeWorkEnd!: Date;
  sameDate = false;
  // durationMinutes!: number;
  // durationHours!: number;

  ngOnChanges() {
    if (this.entry) {
      this.timeWorkStart = new Date(this.entry.timeWorkStart.timestamp);
      this.timeWorkEnd = new Date(this.entry.timeWorkEnd.timestamp);
      this.sameDate = this.timeWorkStart.toDateString() === this.timeWorkEnd.toDateString();
    }
  }
}
