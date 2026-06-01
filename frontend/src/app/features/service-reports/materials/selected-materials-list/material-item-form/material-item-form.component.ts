import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  BehaviorSubject,
  Observable,
  Subject,
  map,
  merge,
  of,
  shareReplay,
  takeUntil,
  withLatestFrom,
} from 'rxjs';

import {
  MaterialsInventoryItemBase,
  SchematicElement,
  ServiceReportMaterialsEntry,
} from '../../../models';
import { MaterialsService } from '../../materials.service';

// ServiceReportMaterialsEntry
// {
//   quantity: 1,
//   schemaID: 1,
//   schematicLabel: '',
//   name: 'Fan - 2GDS25  133X190R',
//   itemNumber: null,
//   dismantledSerialNumber: '24-16-0092',
//   installedSerialNumber: '19-23-0103',
// },

interface MaterialItem {
  name: FormControl<string>;
  schematicLabel: FormControl<string | null>;
}

interface MaterialItemForm {
  name: FormControl<string>;
  schematicLabel: FormControl<string | null>;
}

@Component({
  selector: 'app-material-item-form',
  templateUrl: './material-item-form.component.html',
  styleUrls: ['./material-item-form.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class MaterialItemFormComponent implements OnChanges, OnDestroy {
  @Input() schematicElement: SchematicElement | undefined;
  @Input() item: ServiceReportMaterialsEntry | undefined;

  availableSchematicElements$: Observable<SchematicElement[]>;
  availableMaterials$: Observable<string[]>;
  private _schematicElement$ = new BehaviorSubject<SchematicElement | undefined>(undefined);

  form: FormGroup<MaterialItemForm>;

  private _destroy$ = new Subject<void>();

  materialsSearchFilter$ = new BehaviorSubject<string>('');

  constructor(private materialsService: MaterialsService) {
    this.availableMaterials$ = merge(this._schematicElement$, this.materialsSearchFilter$).pipe(
      withLatestFrom(
        this._schematicElement$,
        this.materialsSearchFilter$,
        of(this.materialsService.materialsInventoryItems),
      ),
      map(
        ([_, element, searchString, materials]: [
          any,
          SchematicElement | undefined,
          string,
          MaterialsInventoryItemBase[],
        ]) => {
          let itemsFilteredByElement = materials.filter(
            (item) => item.schematicLabel === element?.label,
          );

          if (itemsFilteredByElement.length === 0) {
            // Skip items with duplicated names (same name for different schematic elements)
            itemsFilteredByElement = [
              ...new Map(materials.map((item) => [item.name, item])).values(),
            ];
          }

          const result = itemsFilteredByElement.filter(
            (option) => option.name.toLowerCase().indexOf(searchString.toLowerCase()) !== -1,
          );

          console.log('HERE: result: ', result);
          return result.map((item) => item.name);
        },
      ),
      shareReplay(1),
    );

    this.availableSchematicElements$ = of(this.materialsService.schematicElements);

    this.form = new FormGroup<MaterialItemForm>({
      name: new FormControl(this.item?.name || '', {
        nonNullable: true,
        validators: Validators.required,
      }),
      schematicLabel: new FormControl(this.item?.schematicLabel || null),
    });

    this.form.controls.schematicLabel.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe((schematicLabel) => {
        this._schematicElement$.next(
          schematicLabel !== null ? { id: schematicLabel, label: schematicLabel } : undefined,
        );
      });

    this.form.controls.name.valueChanges.pipe(takeUntil(this._destroy$)).subscribe((name) => {
      console.log('HERE: Value changes', name);
      this.materialsSearchFilter$.next(name);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this._schematicElement$.next(this.schematicElement);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  onSelectSchematicElement(element: SchematicElement) {
    this._schematicElement$.next(element);
  }

  onSubmit() {
    console.log('HERE: onSUBMIT', this.form.getRawValue());
  }
}
