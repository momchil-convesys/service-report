import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export function markAllControlsAsDirty(abstractControls: AbstractControl[]): void {
  abstractControls.forEach((abstractControl) => {
    abstractControl.markAsDirty({ onlySelf: true });

    if (abstractControl instanceof FormGroup) {
      markAllControlsAsDirty(Object.values((abstractControl as FormGroup).controls));
    } else if (abstractControl instanceof FormArray) {
      markAllControlsAsDirty((abstractControl as FormArray).controls);
    }
  });
}
