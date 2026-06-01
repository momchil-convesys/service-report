import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

//const apiBaseUrl = environment.apiUrl;
const apiBaseUrl = window.apiBaseUrl;
interface MaterialRaw {
  name: string;
  // itemNumber: string;
  schematicLabel: string;
}

interface InverterSchemaRaw {
  id: string;
  name: string;
  description: string;
  version: string;
  status: string;
  dateModified: string;
  materials: MaterialRaw[];
  files: string[];
}

export interface Material extends MaterialRaw {}
export interface InverterSchema extends InverterSchemaRaw {}

// export interface InventoryItem {
//   id: string; // itemNumber
//   name: string; // itemName
// }

export type InventoryItem = string;

@Injectable()
export class MaterialsService {
  private _boundSchema$: ReplaySubject<InverterSchema | undefined> = new ReplaySubject(); // All entries should belong to one schema
  boundSchema$ = this._boundSchema$.asObservable();

  private _currentSchema$: ReplaySubject<InverterSchema | undefined> = new ReplaySubject();
  currentSchema$ = this._currentSchema$.asObservable();

  selectedSchemaIndex!: number;

  private _boundSchemaId: string | undefined;

  itemsBySchematicLabel: {
    [schemaId: string]: {
      [schematicLabel: string]: InventoryItem[]; // array of items for schematic element
    };
  } = {};

  private _inventory$ = new ReplaySubject<InventoryItem[]>();
  inventory$: Observable<InventoryItem[]> = this._inventory$.asObservable();

  private schemas: InverterSchema[] | undefined;

  constructor(private http: HttpClient) {}

  getSchemas() {
    if (this.schemas) {
      console.log('Returning cached value!');
      return of(this.schemas);
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .get<InverterSchemaRaw[]>(`${apiBaseUrl}/service-reports/schemas`, { headers })
      .pipe(
        map((data) => data.map((schema) => ({ ...schema, id: schema.id.toString() }))),
        tap((data) => this.cacheSchemas(data)),
        catchError(this.handleError),
      );
  }

  selectSchemaAtIndex(i: number) {
    this.selectedSchemaIndex = i;
    if (this.schemas && this.schemas.length > 0) {
      this._currentSchema$.next(this.schemas[i]);
    }
  }

  setBoundSchema(schemaId: string | undefined) {
    this._boundSchemaId = schemaId;

    if (this.schemas && this.schemas?.length > 0) {
      this.setBoundSchemaSafe();
    }
  }

  private setBoundSchemaSafe() {
    const newBoundSchema = this.schemas?.find((schema) => schema.id === this._boundSchemaId);
    this._boundSchema$.next(newBoundSchema);

    if (newBoundSchema) {
      this._currentSchema$.next(newBoundSchema);

      // Keep last bound schema as default selected
      const index =
        this.schemas && this.schemas.findIndex((schema) => newBoundSchema.id === schema.id);
      this.selectedSchemaIndex = index && index >= 0 ? index : 0;
    }
  }

  private cacheSchemas(data: InverterSchema[]) {
    const inventory: Set<InventoryItem> = new Set();
    data.map((schema) => {
      this.itemsBySchematicLabel[schema.id] = {};
      schema.materials.map((material: MaterialRaw) => {
        if (!this.itemsBySchematicLabel[schema.id][material.schematicLabel]) {
          this.itemsBySchematicLabel[schema.id][material.schematicLabel] = [];
        }
        this.itemsBySchematicLabel[schema.id][material.schematicLabel].push(material.name);
        inventory.add(material.name);
      });
    });
    const inventorySorted = Array.from(inventory).sort();
    this._inventory$.next(inventorySorted);
    this.schemas = data || [];
    this.selectSchemaAtIndex(0);
    this.setBoundSchema(this._boundSchemaId);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    // Return an observable with a user-facing error message.
    return throwError('Something bad happened. Please try again later.');
  }
}
