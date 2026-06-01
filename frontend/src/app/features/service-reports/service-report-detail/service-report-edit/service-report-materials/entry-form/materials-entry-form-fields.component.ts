import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { InventoryItem, InverterSchema, MaterialsService } from '../materials.service';

@Component({
  selector: 'app-materials-entry-form-fields',
  templateUrl: './materials-entry-form-fields.component.html',
  styleUrls: ['./materials-entry-form-fields.component.less'],
  standalone: false,
})
export class MaterialsEntryFormFieldsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() entryForm!: FormGroup;
  @Input() schema!: InverterSchema | null;
  @Input() readonlySchematicLabel: boolean = false;

  private inventory: InventoryItem[] = [];

  schematicLabels: string[] = [];
  filteredInventoryItems: InventoryItem[] = [];

  private destroyed$ = new Subject<void>();
  constructor(
    public materialsService: MaterialsService,
    private el: ElementRef,
  ) {
    this.materialsService.inventory$.pipe(takeUntil(this.destroyed$)).subscribe((inventory) => {
      this.inventory = inventory;
      this.filteredInventoryItems = this.inventory;
    });
    // All available parts
  }

  ngOnInit() {
    if (this.entryForm) {
      this.entryForm
        .get('quantity')!
        .valueChanges.pipe(takeUntil(this.destroyed$))
        .subscribe((value) => {
          if (value <= 0) {
            this.entryForm!.get('quantity')!.setValue(1); /////todo
          }
        });

      this.entryForm
        .get('schematicLabel')!
        .valueChanges.pipe(
          startWith(this.entryForm.get('schematicLabel')!.value),
          takeUntil(this.destroyed$),
        )
        .subscribe((value) => {
          if (this.schema) {
            if (value?.length > 0) {
              this.filteredInventoryItems =
                this.materialsService.itemsBySchematicLabel[this.schema.id][value] || [];
            } else {
              this.filteredInventoryItems = this.inventory;
            }

            // TBD
            // Provide whole inventory if no items are provided for schematicLabel
            if (this.filteredInventoryItems.length === 0) {
              this.filteredInventoryItems = this.inventory;
            }

            if (this.readonlySchematicLabel) {
              this.updateNameValue();
            }
          }
        });
    }
  }

  ngOnChanges() {
    if (this.schema) {
      this.schematicLabels =
        Object.keys(this.materialsService.itemsBySchematicLabel[this.schema.id]) || [];
    } else {
      this.schematicLabels = [];
    }

    this.entryForm!.get('schemaID')!.setValue(this.schema?.id || '');
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  typeaheadOnSelect(fieldName: string, event: any) {
    // ngx-bootstrap typeahead does not mark the field as dirty
    // when value is picked from dropdown
    this.entryForm!.get(fieldName)!.markAsDirty();

    if (fieldName === 'schematicLabel') {
      this.updateNameValue();
    }
  }

  private updateNameValue() {
    if (this.filteredInventoryItems.length === 1) {
      this.entryForm.get('name')!.setValue(this.filteredInventoryItems[0]);
    } else {
      // Reset name field when schematic label value is picked from typeahead
      this.entryForm.get('name')!.setValue('');
      this.entryForm.get('name')!.markAsPristine();

      //  const nameInputElement = this.el.nativeElement.querySelector('[data-name-input]');
      //  nameInputElement?.focus();
    }
  }
}
