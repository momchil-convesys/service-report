import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import {
  getWindDirectionFromDegree16,
  getWindDirectionFromDegree8,
  WIND_DIRECTIONS_16,
  WIND_DIRECTIONS_8,
  WindDirection,
  WindDirection8,
} from '../../../constants/_wind';

@Component({
  selector: 'app-wind-widgets-page',
  imports: [
    ReactiveFormsModule,
    NzInputModule,
    NzInputNumberModule,
    NzCardModule,
    NzGridModule,
    NzTypographyModule,
    NzDividerModule,
    NzTagModule,
    NzSpaceModule,
  ],
  templateUrl: './wind-widgets-page.component.html',
  styleUrl: './wind-widgets-page.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WindWidgetsPageComponent {
  windDirectionControl = new FormControl<number | null>(null);

  windDirection16: WindDirection | undefined;
  windDirection8: WindDirection8 | undefined;

  // Expose the arrays for template use
  WIND_DIRECTIONS_16 = WIND_DIRECTIONS_16;
  WIND_DIRECTIONS_8 = WIND_DIRECTIONS_8;

  constructor(private fb: FormBuilder) {
    this.windDirectionControl.valueChanges.subscribe((value) => {
      if (value !== null && !isNaN(value)) {
        this.windDirection16 = getWindDirectionFromDegree16(value);
        this.windDirection8 = getWindDirectionFromDegree8(value);
      } else {
        this.windDirection16 = undefined;
        this.windDirection8 = undefined;
      }
    });
  }

  getDirectionDisplay(direction: WindDirection | WindDirection8 | undefined): string {
    if (!direction) return 'No direction found';
    return `${direction.direction} (${direction.code})`;
  }

  getDegreeRange(direction: WindDirection | WindDirection8 | undefined): string {
    if (!direction || !direction.degreeRange) return 'N/A';
    const [min, max] = direction.degreeRange;
    return `${min}° - ${max}°`;
  }

  // Compass visualization methods
  getCompassRotation(degree: number): string {
    return `rotate(${degree}deg)`;
  }

  isActiveDirection16(direction: WindDirection): boolean {
    if (this.windDirectionControl.value === null) return false;

    const inputDegree = this.windDirectionControl.value;
    const foundDirection = getWindDirectionFromDegree16(inputDegree);
    return foundDirection?.code === direction.code;
  }

  isActiveDirection8(direction: WindDirection8): boolean {
    if (this.windDirectionControl.value === null) return false;

    const inputDegree = this.windDirectionControl.value;
    const foundDirection = getWindDirectionFromDegree8(inputDegree);
    return foundDirection?.code === direction.code;
  }

  isActiveDirection(direction: WindDirection | WindDirection8): boolean {
    if (this.windDirectionControl.value === null) return false;

    const inputDegree = this.windDirectionControl.value;

    // Check if this direction is from the 16-direction array
    const is16Direction = WIND_DIRECTIONS_16.some((d) => d.code === direction.code);

    if (is16Direction) {
      // 16-direction model
      const foundDirection = getWindDirectionFromDegree16(inputDegree);
      return foundDirection?.code === direction.code;
    } else {
      // 8-direction model
      const foundDirection = getWindDirectionFromDegree8(inputDegree);
      return foundDirection?.code === direction.code;
    }
  }

  getCompassDirectionStyle(direction: WindDirection | WindDirection8): any {
    const isActive = this.isActiveDirection(direction);
    return {
      transform: this.getCompassRotation(direction.degree),
      'background-color': isActive ? '@primary-color' : '@background-color-base',
      color: isActive ? '@text-color-inverse' : '@text-color',
      'font-weight': isActive ? '600' : '400',
    };
  }
}
