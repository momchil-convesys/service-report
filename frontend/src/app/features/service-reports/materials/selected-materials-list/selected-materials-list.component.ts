import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable, map, merge } from 'rxjs';
import { SchematicElement } from '../../models';
import { MaterialsPickerService } from '../../service-report-detail/service-report-edit/service-report-materials/materials-picker.service';
//import { MaterialsPickerService } from '../materials-picker.service';

@Component({
  selector: 'app-selected-materials-list',
  templateUrl: './selected-materials-list.component.html',
  styleUrls: ['./selected-materials-list.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SelectedMaterialsListComponent {
  selectedElements$: Observable<SchematicElement[]>;
  constructor(pickerService: MaterialsPickerService) {
    this.selectedElements$ = merge(
      pickerService.elementSelected$,
      pickerService.elementDeselected$,
    ).pipe(map(() => pickerService.selectedElements));
  }
}
