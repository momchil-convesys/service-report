import { Injectable } from '@angular/core';
import { MaterialsInventoryItemBase, SchematicElement } from '../models';
import { inverterSchemas } from './inverter-schemas';

@Injectable()
export class MaterialsService {
  materialsInventoryItems: MaterialsInventoryItemBase[] = [];
  schematicElements: SchematicElement[];

  constructor() {
    // TODO: Load from backend
    this.materialsInventoryItems = inverterSchemas.map((schema: any) => schema.materials).flat();
    const allElements = this.materialsInventoryItems
      .map((item) => ({
        id: item.schematicLabel,
        label: item.schematicLabel,
      }))
      .flat();

    this.schematicElements = [...new Map(allElements.map((item) => [item.id, item])).values()].sort(
      (a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }),
    );
  }
}
