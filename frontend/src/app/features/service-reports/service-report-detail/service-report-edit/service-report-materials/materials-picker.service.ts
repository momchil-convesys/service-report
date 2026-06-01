import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { SchematicElement } from './models';

@Injectable()
export class MaterialsPickerService {
  selectedElements: SchematicElement[] = [];
  formArray: FormArray;

  schemaZoomIn = new Subject();
  schemaZoomOut = new Subject();
  schemaAutofit = new Subject();

  private _elementSelected$ = new Subject<SchematicElement>();
  elementSelected$: Observable<SchematicElement> = this._elementSelected$.asObservable();

  private _elementDeselected$ = new Subject<SchematicElement>();
  elementDeselected$: Observable<SchematicElement> = this._elementDeselected$.asObservable();

  constructor(private fb: FormBuilder) {
    this.formArray = this.fb.array([]);
  }

  selectElement(el: SchematicElement) {
    this.formArray.insert(
      0,
      this.fb.group(
        {
          name: ['', { updateOn: 'change' }],
          quantity: [1],
          dismantledSerialNumber: [''],
          installedSerialNumber: [''],
          schemaID: [''],
          schematicLabel: [el.label, { updateOn: 'change' }],
        },
        { updateOn: 'blur' },
      ),
    );

    this.selectedElements.unshift(el);
    this._elementSelected$.next(el);
  }

  deselectElement(el: SchematicElement) {
    const index = this.selectedElements.findIndex((element) => element.id === el.id);
    this.formArray.removeAt(index);
    this.selectedElements = this.selectedElements.filter((value) => el.id !== value.id);
    this._elementDeselected$.next(el);
  }
  getSelectedFG(el: any) {
    const index = this.selectedElements.findIndex((element) => element.id === el.id);
    const group = this.formArray.at(index) as FormGroup;
    return group;
  }
  isOkdeselect(group: any) {
    const hasEntry =
      group.value['dismantledSerialNumber'] !== '' ||
      group.value['installedSerialNumber'] !== '' ||
      group.value['name'] !== '' ||
      group.value['quantity'] > 1;

    return !hasEntry;
  }
}
