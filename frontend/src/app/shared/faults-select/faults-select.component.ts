import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Observable } from 'rxjs';
import { FaultsTemplate } from '../../data/models';
import { FaultsService } from '../faults-table/faults-service';

@Component({
  selector: 'app-faults-select',
  templateUrl: './faults-select.component.html',
  styleUrls: ['./faults-select.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FaultsService],
  standalone: false,
})
export class FaultsSelectComponent implements OnInit {
  @Input() initiallySelectedFaultIds: string[] = [];
  @Input() faultsTemplate: FaultsTemplate | undefined;

  selectedFaultIds$: Observable<Set<string>>;

  constructor(private _faultsService: FaultsService) {
    this.selectedFaultIds$ = this._faultsService.selectedFaultIds$;
  }

  ngOnInit(): void {
    this._faultsService.setSelectedFaultIds(this.initiallySelectedFaultIds);
  }

  getSelectedFaultIds(): string[] {
    return Array.from(this._faultsService.selectedFaultIds);
  }

  onToggleFaultSelection(faultId: string, select: boolean) {
    this._faultsService.toggleFaultSelection(faultId, select);
  }

  onFaultRowClick(faultId: string) {
    this._faultsService.toggleFaultSelection(faultId);
  }

  clearSelectedFaults() {
    this._faultsService.clearSelectedFaults();
  }
}
