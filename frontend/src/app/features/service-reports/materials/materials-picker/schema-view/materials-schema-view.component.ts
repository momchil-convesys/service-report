import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, of } from 'rxjs';
import { catchError, take, takeUntil } from 'rxjs/operators';
import { SchematicElement } from '../../../models';
import { MaterialsPickerService } from '../../materials-picker.service';

@Component({
  selector: 'app-materials-schema-view',
  templateUrl: './materials-schema-view.component.html',
  styleUrls: ['./materials-schema-view.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class MaterialsSchemaViewComponent implements AfterViewInit, OnDestroy {
  @ViewChild('svgContainer') svgContainer: ElementRef | null = null;

  rawSvg: SafeHtml = 'TODO: Loading...';
  svgElement: SVGSVGElement | undefined;

  private svgContainerWidth = 0;
  private svgScaleValue = 1;

  private destroyed$ = new Subject<void>();

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private materialsPickerService: MaterialsPickerService,
    private cd: ChangeDetectorRef,
  ) {
    this.materialsPickerService.elementSelected$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((el) => {
        this.toggleElementSelection(el.id, true);
      });

    this.materialsPickerService.elementDeselected$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((el) => {
        this.toggleElementSelection(el.id, false);
      });

    this.materialsPickerService.schemaZoomOut.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.onZoomOut();
    });

    this.materialsPickerService.schemaZoomIn.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.onZoomIn();
    });

    this.materialsPickerService.schemaAutofit.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.onFitWidth();
    });
  }

  ngAfterViewInit() {
    const headers = new HttpHeaders({ 'Content-Type': 'image/svg+xml' });
    const schemaUrl = 'http://localhost:3333/inverter-schemas/SOLO500-Decorated-cf2f255.svg';

    this.http
      .get(schemaUrl, { headers, responseType: 'text' })
      .pipe(
        // delay(150),
        catchError(() => {
          return of('Failed to load schema!');
        }),
        take(1),
      )
      .subscribe((svgSample) => {
        this.rawSvg = this.sanitizer.bypassSecurityTrustHtml(svgSample);
        this.cd.detectChanges();

        this.svgElement = this.svgContainer?.nativeElement.querySelector('svg');
        this.initSvg();

        this.onFitWidth();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  onZoomIn() {
    this.scaleSvg(this.svgScaleValue * 1.05);
  }

  onZoomOut() {
    this.scaleSvg(this.svgScaleValue * 0.95);
  }

  onFitWidth() {
    this.svgContainerWidth = this.svgContainer?.nativeElement.clientWidth;

    this.svgElement?.setAttribute(
      'viewBox',
      `0 0 ${this.svgElement.getAttribute('width')} ${this.svgElement.getAttribute('height')}`,
    );

    this.scaleSvg(1);
  }

  private scaleSvg(scaleValue: number) {
    if (this.svgElement) {
      this.svgElement.style.width = `${this.svgContainerWidth}px`; // `${this.svgContainerWidth * scaleValue}px`;
      this.svgElement.style.transform = `scale(${scaleValue})`;
    }

    this.svgScaleValue = scaleValue;
  }

  private initSvg() {
    const selectableElements = this.svgElement?.querySelectorAll('[data-selectable="true"]') || [];

    for (let i = 0; i < selectableElements.length; ++i) {
      const target: SVGSVGElement = <SVGSVGElement>selectableElements[i];

      target.addEventListener('click', this.clickHandler.bind(this));
    }

    this.svgElement?.addEventListener('mousedown', this.handleMouseDown);
  }

  private clickHandler(event: any) {
    const target: SVGTextElement = event.currentTarget;

    const element: SchematicElement = {
      id: target.id,
      label: target.getAttribute('data-schematic-label') || '',
    };

    if (target.getAttribute('data-selected') === '0') {
      this.materialsPickerService.selectElement(element);
    } else {
      this.materialsPickerService.deselectElement(element);
    }
  }

  private toggleElementSelection(id: string, selected: boolean) {
    const target = this.svgElement?.getElementById(id);
    target?.setAttribute('data-selected', selected ? '1' : '0');
  }

  private handleMouseDown = (event: MouseEvent) => {
    this.svgElement?.addEventListener('mousemove', this.handleMouseMove);
    this.svgElement?.addEventListener('mouseup', this.handleMouseUp);
    this.svgElement?.addEventListener('mouseleave', this.handleMouseLeave);
  };

  private handleMouseMove = (event: MouseEvent) => {
    event.preventDefault();

    (<HTMLElement>this.svgContainer?.nativeElement).scrollBy({
      left: -event.movementX,
      top: -event.movementY,
    });
  };

  private handleMouseUp = (event: MouseEvent) => {
    event.preventDefault();
    this.removeMouseEventListeners();
  };

  private handleMouseLeave = (event: MouseEvent) => {
    event.preventDefault();
    this.removeMouseEventListeners();
  };

  private removeMouseEventListeners() {
    this.svgElement?.removeEventListener('mousemove', this.handleMouseMove);
    this.svgElement?.removeEventListener('mouseup', this.handleMouseUp);
    this.svgElement?.removeEventListener('mouseleave', this.handleMouseLeave);
  }
}
