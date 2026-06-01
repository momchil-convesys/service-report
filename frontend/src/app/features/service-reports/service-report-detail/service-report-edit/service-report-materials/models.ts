export interface SchematicElement {
  id: string;
  label: string;
}

export class MaterialEntry {
  schemaID!: string;
  name!: string;
  quantity!: number;
  dismantledSerialNumber!: string;
  installedSerialNumber!: string;
  schematicLabel!: string;
  itemNumber?: string;

  static toFormValue(entry: MaterialEntry): MaterialEntryEntryFormValue {
    // Omit item number, as it is not mapped to a form control
    const { itemNumber, ...formControls } = entry;

    return {
      ...formControls,
    };
  }
}

export class MaterialEntryEntryFormValue extends MaterialEntry {
  static toEntry(formValue: MaterialEntryEntryFormValue): MaterialEntry {
    return {
      ...formValue,
    };
  }
}
