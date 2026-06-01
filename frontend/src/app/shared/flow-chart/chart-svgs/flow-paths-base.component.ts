import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { flowElementsSVGString } from './svg-templates/flow-elements-svg-string';

@Component({
  imports: [],
  template: '',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowPathsBaseComponent implements AfterViewInit {
  @ContentChild('test', { read: TemplateRef }) test: TemplateRef<any> | undefined;

  constructor(private elRef: ElementRef) {}

  ngAfterViewInit(): void {
    const svg: SVGElement | undefined = this.elRef.nativeElement.querySelector('svg');

    const ngContentElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    if (svg && ngContentElement) {
      ngContentElement.innerHTML = flowElementsSVGString;
      svg.appendChild(ngContentElement);
    }
  }
}
