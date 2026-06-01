import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { InverterSchema, MaterialsService } from '../materials.service';

@Component({
  selector: 'app-materials-schema-select',
  templateUrl: './materials-schema-select.component.html',
  styleUrls: ['./materials-schema-select.component.less'],
  standalone: false,
})
export class MaterialsSchemaSelectComponent implements OnInit, OnDestroy {
  schemas: InverterSchema[] | undefined;

  private destroyed$ = new EventEmitter<void>();

  constructor(public materialsService: MaterialsService) {
    this.materialsService
      .getSchemas()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((schemas) => (this.schemas = schemas));
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.destroyed$.next();
  }

  onSchemaSelectionChange(input: EventTarget | null) {
    if (input instanceof HTMLInputElement) {
      this.materialsService.selectSchemaAtIndex(Number(input.value));
    }
  }
}
