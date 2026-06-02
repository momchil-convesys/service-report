import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

export const updateOnOption = 'change'; // alternatively = 'change'

@Component({
  template: '',
  standalone: false,
})
export abstract class EntryFormComponent<T> implements OnInit, OnDestroy {
  @Input() entryData!: T | null;
  @Output() submitForm = new EventEmitter<T>();
  @Output() resetForm = new EventEmitter();
  @Output() deleteEntry = new EventEmitter();
  @Output() submitFormMultiple = new EventEmitter<T[]>();

  entryForm!: FormGroup;

  protected destroyed$ = new Subject<void>();

  private entryFormInitialValue!: T;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.entryForm) {
      if (changes['entryData'].currentValue) {
        this.setFGValue(this.entryForm, changes['entryData'].currentValue);
        // this.entryForm.setValue(changes['entryData'].currentValue);
      } else {
        this.entryForm.reset(this.entryFormInitialValue);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  onSubmit() {
    if (this.entryForm) {
      this.entryForm.updateValueAndValidity();
      this.entryForm.markAllAsTouched();

      if (this.entryForm.valid) {
        this.submitForm.emit(this.entryForm.getRawValue());
        this.entryForm.reset(this.entryFormInitialValue);
      }
    }
  }

  onReset() {
    this.resetForm.emit();
    if (this.entryForm) {
      this.entryForm.reset(this.entryFormInitialValue);
    }
  }

  onDelete() {
    this.deleteEntry.emit();
  }

  protected setInitialValue(value: T) {
    this.entryFormInitialValue = this.entryForm?.getRawValue() || value;
  }

  protected patchInitialValue(patch: any) {
    this.entryFormInitialValue = { ...this.entryFormInitialValue, ...patch };
  }
  public setFGValue(group: FormGroup, data: any): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.controls[key];

      abstractControl.setValue(data[key] ?? null);
    });
  }
}
