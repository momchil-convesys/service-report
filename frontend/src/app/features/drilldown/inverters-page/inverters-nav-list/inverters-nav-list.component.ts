import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Inverter_DTO, TransformerStation_DTO } from '../../../../data/dtos';

@Component({
  selector: 'app-inverters-nav-list',
  imports: [RouterLink, RouterLinkActive, NzButtonModule, NzIconModule],
  templateUrl: './inverters-nav-list.component.html',
  styleUrl: './inverters-nav-list.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvertersNavListComponent {
  @Input({ required: true }) metadata: TransformerStation_DTO[] = [];
  @Input() loading = false;

  get invertersList(): Inverter_DTO[] {
    return this.metadata.map((tsMetadata) => tsMetadata.inverters).flat();
  }

  get showTsContext(): boolean {
    return this.metadata.length > 1;
  }
}
