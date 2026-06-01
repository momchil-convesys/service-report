import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable, map, merge } from 'rxjs';
import { SchematicElement } from '../../models';
import { MaterialsPickerService } from '../materials-picker.service';

/**
 * TODO:
 * Components with the same selector are not allowed.
 * There already is a component with app-materials-picker selector.
 */

@Component({
  selector: 'app-materials-picker-duplicate',
  templateUrl: './materials-picker.component.html',
  styleUrls: ['./materials-picker.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MaterialsPickerService],
  standalone: false,
})
export class MaterialsPickerComponent_Duplicate {
  selectedElements$: Observable<SchematicElement[]>;
  constructor(private pickerService: MaterialsPickerService) {
    this.selectedElements$ = merge(
      pickerService.elementSelected$,
      pickerService.elementDeselected$,
    ).pipe(map(() => pickerService.selectedElements));
  }

  onZoomIn() {
    this.pickerService.schemaZoomIn.next();
  }

  onZoomOut() {
    this.pickerService.schemaZoomOut.next();
  }

  onAutoFit() {
    this.pickerService.schemaAutofit.next();
  }
}
