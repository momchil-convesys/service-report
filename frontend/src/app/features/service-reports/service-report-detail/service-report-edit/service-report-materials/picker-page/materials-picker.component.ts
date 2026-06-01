import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MaterialsPickerService } from '../materials-picker.service';
import { InverterSchema } from '../materials.service';
import { MaterialEntryEntryFormValue, SchematicElement } from '../models';

@Component({
  selector: 'app-materials-picker',
  templateUrl: './materials-picker.component.html',
  styleUrls: ['./materials-picker.component.less'],
  providers: [MaterialsPickerService],
  standalone: false,
})
export class MaterialsPickerComponent {
  @Input() schema!: InverterSchema | null;
  @Output() submitItems = new EventEmitter<MaterialEntryEntryFormValue[]>();
  @Output() cancel = new EventEmitter<void>();
  selectedElements: SchematicElement[] = [];
  constructor(public materialsPickerService: MaterialsPickerService) {}

  onSubmit() {
    if (this.materialsPickerService.formArray.valid) {
      this.submitItems.next(this.materialsPickerService.formArray.getRawValue());
    }
  }

  onCancel() {
    this.cancel.next();
  }

  onRemoveItem(el: SchematicElement) {
    this.materialsPickerService.deselectElement(el);
  }

  asFormGroup(fa: FormArray, i: number): FormGroup {
    return fa.at(i) as FormGroup;
  }

  onElementSelectedToggle(_event: boolean): void {
    // console.log('event', event);
    this.selectedElements = this.materialsPickerService.selectedElements;
  }
}
