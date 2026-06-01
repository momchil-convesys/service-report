import { Component, Input, OnChanges } from '@angular/core';
import { MaterialEntry } from '../models';

@Component({
  selector: 'app-materials-entry-view',
  templateUrl: './materials-entry-view.component.html',
  styleUrls: ['./materials-entry-view.component.less'],
  standalone: false,
})
export class MaterialsEntryViewComponent implements OnChanges {
  @Input() entry!: MaterialEntry;

  ngOnChanges() {}
}
