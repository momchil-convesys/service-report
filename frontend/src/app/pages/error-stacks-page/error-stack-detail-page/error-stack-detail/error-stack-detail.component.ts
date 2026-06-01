import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  ViewEncapsulation,
} from '@angular/core';
import { ErrorStackIndexValue } from '../../../../constants';
import { FaultDefinitionGroup } from '../../../../data/models';
import { ErrorStack, ErrorStackDetail } from '../../_data/error-stack.model';

@Component({
  selector: 'app-error-stack-detail',
  templateUrl: './error-stack-detail.component.html',
  styleUrls: ['./error-stack-detail.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ErrorStackDetailComponent implements OnChanges {
  @Input() errorStackSummary: ErrorStack | undefined;
  @Input() errorStackDetail: ErrorStackDetail | undefined;
  @Input() faultGroups: FaultDefinitionGroup[] | undefined;
  @Input() hideFilteringOptions: boolean | undefined;
  @Input() loadingData: boolean = false;

  indices: number[] = [];

  ngOnChanges() {
    if (this.errorStackDetail) {
      this._init(this.errorStackDetail);
    }
  }

  valueAtIndexForFault(index: number, faultId: string): ErrorStackIndexValue {
    const values = this.errorStackDetail?.values[faultId];
    if (!values) {
      return ErrorStackIndexValue.NotAvailable;
    }
    return values[index] || ErrorStackIndexValue.NotAvailable;
  }

  private _init(errorStack: ErrorStackDetail) {
    const indicesCount = errorStack.stackSize;
    if (indicesCount === this.indices.length) {
      return;
    }

    const indices: number[] = [];
    for (let i = 0; i < indicesCount; ++i) {
      indices.push(i);
    }

    this.indices = indices;
  }
}
