import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-list-details-layout',
  templateUrl: './list-details-layout.component.html',
  styleUrls: ['./list-details-layout.component.less'],
  standalone: false,
})
export class ListDetailsLayoutComponent implements OnInit {
  @Input() listTitle: string = '';
  @Input() emptyList: string | undefined;
  @HostBinding('class.compact-form') @Input() compactForm: boolean = false;

  constructor() {}

  ngOnInit(): void {}
}
