import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-datetime-picker',
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.less'],
  standalone: false,
})
export class DatetimePickerComponent implements OnInit {
  @Input() formControlDP!: FormControl;

  @Input() label!: string;
  @Input() labelFor!: string;
  @Input() format = 'dd-MM-yyyy HH:mm';

  constructor() {}

  ngOnInit(): void {}
}
