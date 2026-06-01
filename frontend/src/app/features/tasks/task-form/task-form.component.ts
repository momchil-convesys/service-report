/* eslint-disable @typescript-eslint/unbound-method */
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TaskNodeDefinition } from '../../../data/models';

interface TaskForm {
  title: FormControl<string>;
  description: FormControl<string | null>;
  forceOrder: FormControl<boolean>;
}

export interface TaskNodeExtended extends TaskNodeDefinition {
  parent: TaskNodeDefinition;
}

@Component({
  selector: 'app-task-form[node]',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent implements OnChanges {
  @Input() node!: TaskNodeDefinition;

  @Output() save = new EventEmitter<TaskNodeDefinition>();
  @Output() cancel = new EventEmitter<TaskNodeDefinition>();
  @Output() delete = new EventEmitter<TaskNodeDefinition>();

  form!: FormGroup<TaskForm>;

  constructor() {
    this.form = new FormGroup<TaskForm>({
      title: new FormControl('', { nonNullable: true }),
      description: new FormControl('', { nonNullable: false }),
      forceOrder: new FormControl(false, { nonNullable: true }),
    });
  }

  ngOnChanges(): void {
    const node: TaskNodeDefinition = this.node;

    // Setting value with timeout fixes texarea initial autosize
    setTimeout(() => {
      this.form.setValue({
        title: node.name,
        description: node.description,
        forceOrder: node.forceOrder,
      });
    }, 0);
  }

  onCancel() {
    this.cancel.next(this.node);
  }

  onDelete() {
    this.delete.next(this.node);
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();

      const result: TaskNodeDefinition = {
        ...this.node,
        name: formValue.title,
        description: formValue.description || '',
        forceOrder: formValue.forceOrder,
      };

      console.log('submit VALID, emitting: ', result);

      this.save.emit(result);

      return;
    }

    console.log('submit INVALID', this.form.errors);
  }
}
