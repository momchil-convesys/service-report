import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzCustomColumn, NzTableModule } from 'ng-zorro-antd/table';
import { PlantTopology_DTO } from '../_data/models';

interface CustomColumn extends NzCustomColumn {
  name: string;
  required?: boolean;
  position?: 'left' | 'right';
}

@Component({
  selector: 'app-pt-table-view',
  imports: [
    NzButtonModule,
    NzDividerModule,
    NzGridModule,
    NzIconModule,
    NzModalModule,
    NzTableModule,
    NzIconModule,
    CdkDrag,
    CdkDropList,
  ],
  templateUrl: './pt-table-view.component.html',
  styleUrl: './pt-table-view.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PtTableViewComponent {
  @Input({ required: true }) plantTopology: PlantTopology_DTO | undefined;

  get listOfData(): {
    key: string;
    tsName: string;
    invName: string;
  }[] {
    return (
      this.plantTopology?.transformerStations
        .map((ts) =>
          ts.inverters.map((inv) => ({
            key: ts.id + inv.id,
            tsName: ts.name,
            invName: inv.name,
          })),
        )
        .flat() || []
    );
  }

  customColumn: CustomColumn[] = [
    {
      name: 'Name',
      value: 'name',
      default: true,
      required: true,
      position: 'left',
      width: 200,
      fixWidth: true,
    },
    {
      name: 'Parameter 1',
      value: 'p1',
      default: false,
      width: 200,
    },
    {
      name: 'Parameter 2',
      value: 'p2',
      default: false,
      width: 200,
    },
    {
      name: 'Parameter 3',
      value: 'p3',
      default: false,
      width: 200,
    },
    {
      name: 'Action',
      value: 'action',
      default: true,
      required: true,
      position: 'right',
      width: 200,
    },
  ];

  isVisible: boolean = false;
  title: CustomColumn[] = [];
  footer: CustomColumn[] = [];
  fix: CustomColumn[] = [];
  notFix: CustomColumn[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.title = this.customColumn.filter((item) => item.position === 'left' && item.required);
    this.footer = this.customColumn.filter((item) => item.position === 'right' && item.required);
    this.fix = this.customColumn.filter((item) => item.default && !item.required);
    this.notFix = this.customColumn.filter((item) => !item.default && !item.required);
  }

  drop(event: CdkDragDrop<CustomColumn[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    this.fix = this.fix.map((item) => {
      item.default = true;
      return item;
    });
    this.notFix = this.notFix.map((item) => {
      item.default = false;
      return item;
    });
    this.cdr.markForCheck();
  }

  deleteCustom(value: CustomColumn, index: number): void {
    value.default = false;
    this.notFix = [...this.notFix, value];
    this.fix.splice(index, 1);
    this.cdr.markForCheck();
  }

  addCustom(value: CustomColumn, index: number): void {
    value.default = true;
    this.fix = [...this.fix, value];
    this.notFix.splice(index, 1);
    this.cdr.markForCheck();
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    this.customColumn = [...this.title, ...this.fix, ...this.notFix, ...this.footer];
    this.isVisible = false;
    this.cdr.markForCheck();
  }

  handleCancel(): void {
    this.isVisible = false;
  }
}
