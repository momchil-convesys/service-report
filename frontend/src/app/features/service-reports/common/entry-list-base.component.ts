import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subject } from 'rxjs';

export interface EntryFormValueAdapter<E, F> {
  toEntry(formValue: F): E;
  toFormValue(entry: E): F;
}

@Component({
  template: '',
  standalone: false,
})
export abstract class EntryListBaseComponent<E, F> implements EntryFormValueAdapter<E, F> {
  @Input() entries: E[] = [];
  @Output() dataChange: EventEmitter<E[]> = new EventEmitter();

  selectedEntryIndex: number = -1;
  selectedEntryData$: Subject<F | null> = new Subject();

  abstract toEntry(formValue: F): E;
  abstract toFormValue(entry: E): F;

  constructor() {}

  onSubmit(value: F) {
    const entry = this.toEntry(value);

    if (this.selectedEntryIndex >= 0) {
      this.updateEntryAtIndex(this.selectedEntryIndex, entry);
    } else {
      this.addNewEntry(entry);
    }

    this.onChangeSelectedEntry(-1);
  }

  onSubmitMultiple(valuesArray: F[]) {
    const entries = valuesArray.map((value) => this.toEntry(value));
    this.addNewEntries(entries);
  }

  onReset() {
    this.changeSelectedEntry(-1);
  }

  onDelete() {
    this.deleteEntryAtIndex(this.selectedEntryIndex);
    this.changeSelectedEntry(-1);
  }

  onChangeSelectedEntry(index: number) {
    this.changeSelectedEntry(index);
  }

  private changeSelectedEntry(index: number) {
    this.selectedEntryIndex = index;

    if (index >= 0) {
      const selectedEntry = this.entries[this.selectedEntryIndex];
      this.selectedEntryData$.next(this.toFormValue(selectedEntry));
    } else {
      this.selectedEntryData$.next(null);
    }
  }

  private addNewEntry(entry: E) {
    this.dataChange.emit([...this.entries, entry]);
  }

  private addNewEntries(entries: E[]) {
    this.dataChange.emit([...this.entries, ...entries]);
  }

  private updateEntryAtIndex(index: number, entry: E) {
    const newArray = [...this.entries];
    newArray[index] = entry;
    this.dataChange.emit(newArray);
  }

  private deleteEntryAtIndex(index: number) {
    const newArray = [...this.entries];
    newArray.splice(index, 1);
    this.dataChange.emit(newArray);
  }
}
