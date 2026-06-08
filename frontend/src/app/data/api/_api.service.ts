import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Observable,
  catchError,
  delay,
  filter,
  forkJoin,
  map,
  mergeMap,
  of,
  startWith,
  tap,
} from 'rxjs';
import { APP_LOCALE_ID } from '../../app-locale';
import { KEYCLOAK_DISABLED } from '../../auth/keycloak-constants';
import { DataRequest, IntegrationPeriod, ListMetadata } from '../../constants';
import { handleAnyError } from '../../helpers';
import {
  DataAdapter,
  DeviceAdapter,
  DeviceMetadataAdapter,
  FaultCountersAdapter,
  FaultCountersWithIntegrationPeriodAdapter,
  FaultTemplatesAdapter,
  ParametersTemplateAdapter,
  PlantAdapter,
  TasksAdapter,
  TicketAdapter,
} from '../adapters';
import { ConsumptionWithIntegrationPeriodAdapter } from '../adapters/_consupmtion.adapter';
import { WTCombinedChartDataAdapter, WTDataAdapter } from '../adapters/_wt-data.adapter';
import { DeviceMetadataDTO, User_DTO } from '../dtos';
import {
  ConsumptionWithIntegrationPeriod,
  Device,
  DeviceMetadata,
  DeviceParametersTemplate,
  FaultCountersData,
  FaultCountersWithIntegrationPeriod,
  FaultsTemplate,
  Plant,
  TaskNodeDefinition,
  Ticket,
  TicketActivityItem,
  TicketTaskGroup,
  WTCombinedChartData,
  WTPowerData,
} from '../models';

// TODO: move to env file
// const baseUrl = 'http://localhost:3333';
// const baseUrl = 'http://192.168.1.180:5555';
// const baseUrl = 'http://192.168.1.180:3333';

declare global {
  interface Window {
    apiBaseUrl: string;
    webSocketsBaseUrl: string;
    keycloakUrl: string;
    keycloakRealm: string;
    keycloakClientId: string;

    disableKeycloak: boolean;
  }
}

//const defaultDaseUrl = 'http://localhost:3333';
const defaultDaseUrl = 'http://localhost:3000/api';
const baseUrl = window.apiBaseUrl || defaultDaseUrl;

const fakeDelay = 0;

const mockDeviceMetadataDTOs: DeviceMetadataDTO[] = [
  {
    id: 'inverter-metadata',
    manufacturer: 'Demo',
    softwareVersion: '1.0.0',
    faultsTemplateId: 'mock-faults-template',
    parametersTemplateId: 'mock-parameters-template',
    possibleStates: ['on', 'wrn', 'err', 'off', 'nc', 'srvc', 'stb', 'int'],
    intermediateStates: [],
    deviceLimits: {
      powerLimitSettingMin: 0,
      powerLimitSettingMax: 1000,
    },
  },
];

export class EmptyContentError extends Error {}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  get baseUrl(): string {
    return baseUrl;
  }

  private _defaultHttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  get defaultHttpHeaders() {
    return this._defaultHttpHeaders;
  }

  constructor(public http: HttpClient) {}

  //===============================================================================================
  // Users

  fetchCurrentUser(): Observable<DataRequest<User_DTO>> {
    return this._fetchObject<User_DTO, User_DTO>(`/user`);
  }

  /**
   * GET /users
   * Returns list of all users (visible to current user)
   * or empty list if no users are found.
   */

  fetchUsers(): Observable<DataRequest<User_DTO[]>> {
    return this._fetchList<User_DTO, User_DTO>(`/users`, undefined);
  }

  /**
   * GET /user/settings
   * Returns obejct of type UserSettings
   *
   * UserSettings {
   *    parameterIdsVisibleInDeviceMetricsChartsByPlant: {
   *      [plantId: string]: string[];
   *    };
   *    // other properties may be added here in the feature
   * }
   */

  /**
   * PATCH /user/settings
   * Request body: Partial(!) object of type UserSettings
   *
   * Response body should be the full UserSettings object
   *
   * Example request body: {
   *    parameterIdsVisibleInDeviceMetricsChartsByPlant: {
   *      "plantId_X": ["paramId_3", "paramId_14"];
   *    }
   * }
   */

  //===============================================================================================
  // Plants and devices

  fetchPlants(): Observable<DataRequest<Plant[]>> {
    return this._fetchList(`/plants?_embed=devices`, PlantAdapter);

    // const firstValue = of({
    //   isLoading: true,
    //   data: undefined,
    // });

    // const secondValue = of({
    //   isLoading: false,
    //   data: mock_PlantsWithDevices.map((dto) => PlantAdapter.dtoToModel(dto)),
    // }).pipe(delay(1000));

    // const result = concat(firstValue, secondValue);

    // return result;
  }

  fetchDevices(): Observable<DataRequest<Device[]>> {
    return this._fetchList(`/devices`, DeviceAdapter);
  }

  //===============================================================================================
  // Device metadata

  fetchDeviceMetadataList(): Observable<DataRequest<DeviceMetadata[]>> {
    if (KEYCLOAK_DISABLED) {
      return of({
        isLoading: false,
        data: mockDeviceMetadataDTOs.map((dto) => DeviceMetadataAdapter.dtoToModel(dto)),
      });
    }

    return this._fetchList(`/device-metadata`, DeviceMetadataAdapter);
  }

  fetchDeviceMetadata(id: string): Observable<DataRequest<DeviceMetadata>> {
    return this._fetchObject(`/device-metadata/${id}`, DeviceMetadataAdapter);
  }

  //===============================================================================================
  // Fault templates

  fetchFaultTemplates(): Observable<DataRequest<FaultsTemplate[]>> {
    return this._fetchList(`/fault-definitions`, FaultTemplatesAdapter);
  }

  fetchFaultTemplate(id: string): Observable<DataRequest<FaultsTemplate>> {
    return this._fetchObject(`/fault-definitions/${id}`, FaultTemplatesAdapter);
  }

  //===============================================================================================
  // Parameter templates

  fetchDeviceParameterTemplates(): Observable<DataRequest<DeviceParametersTemplate[]>> {
    return this._fetchList(
      `/parameters-templates?locale=${APP_LOCALE_ID}`,
      ParametersTemplateAdapter,
    );
  }

  fetchDeviceParameterTemplate(id: string): Observable<DataRequest<DeviceParametersTemplate>> {
    return this._fetchObject(
      `/parameters-templates/${id}?locale=${APP_LOCALE_ID}`,
      ParametersTemplateAdapter,
    );
  }

  //===============================================================================================
  // Fault counters

  fetchFaultCounters(
    deviceId: string,
    from: string,
    to: string,
  ): Observable<DataRequest<FaultCountersData>> {
    return this._fetchObject(
      `/fault-counters?deviceId=${deviceId}&from=${from}&to=${to}`,
      FaultCountersAdapter,
    );
  }

  fetchFaultCountersWithIntegrationPeriod(
    deviceId: string,
    faultId: string,
    from: string,
    to: string,
    integrationPeriod: IntegrationPeriod,
  ): Observable<DataRequest<FaultCountersWithIntegrationPeriod>> {
    return this._fetchObject(
      `/fault-counters-split?deviceId=${deviceId}&from=${from}&to=${to}&faultId=${faultId}&integrationPeriod=${integrationPeriod}`,
      FaultCountersWithIntegrationPeriodAdapter,
    );
  }

  //===============================================================================================
  // Consumption

  fetchConsumptionWithIntegrationPeriod(
    deviceIds: string[],
    from: string,
    to: string,
    integrationPeriod: IntegrationPeriod,
  ): Observable<DataRequest<ConsumptionWithIntegrationPeriod[]>> {
    let queryParams = `?from=${from}&to=${to}&integrationPeriod=${integrationPeriod}`;

    if (deviceIds.length > 0) {
      queryParams += deviceIds.map((deviceId) => `&deviceIds=${deviceId}`).join(''); // join('') avoids added comma
    }

    return this._fetchList(`/consumption${queryParams}`, ConsumptionWithIntegrationPeriodAdapter);
  }

  //===============================================================================================
  // Tasks

  fetchRootTaskGroup(): Observable<DataRequest<TaskNodeDefinition>> {
    return this._getRecursive('root').pipe(
      map((data) => ({
        isLoading: false,
        data,
      })),
    );
  }

  createTaskDefinition(item: TaskNodeDefinition): Observable<DataRequest<TaskNodeDefinition>> {
    return this._createItem(`/tasks`, TasksAdapter, item);
  }

  createTaskGroupDefinition(item: TaskNodeDefinition): Observable<DataRequest<TaskNodeDefinition>> {
    return this._createItem(`/task-groups`, TasksAdapter, item);
  }

  updateTaskDefinition(item: TaskNodeDefinition): Observable<DataRequest<TaskNodeDefinition>> {
    return this._updateItem(`/tasks/${item.id}`, TasksAdapter, item);
  }

  updateTaskGroupDefinition(item: TaskNodeDefinition): Observable<DataRequest<TaskNodeDefinition>> {
    return this._updateItem(`/task-groups/${item.id}`, TasksAdapter, item);
  }

  deleteTaskDefinition(item: TaskNodeDefinition): Observable<DataRequest<unknown>> {
    return this._deleteItem(`/tasks/${item.id}`);
  }

  deleteTaskGroupDefinition(item: TaskNodeDefinition): Observable<DataRequest<unknown>> {
    return this._deleteItem(`/task-groups/${item.id}`);
  }

  // PUT /task-groups/:id (Edit task group) // name, options...
  //
  patchTaskNodeChildren(nodeId: string, childrenIds: string[]): Observable<DataRequest<unknown>> {
    const httpOptions = {
      headers: this._defaultHttpHeaders,
    };

    return this._decorateRequest(
      this.http.patch(`${baseUrl}/task-groups/${nodeId}`, { childrenIds }, httpOptions).pipe(
        delay(fakeDelay),
        map((dto) => ({ data: dto })),
      ),
    );
  }

  private _fetchTaskGroupDefinition(id: string): Observable<DataRequest<TaskNodeDefinition>> {
    return this._fetchObject(`/task-groups/${id}`, TasksAdapter);
  }

  private _fetchTaskDefinition(id: string): Observable<DataRequest<TaskNodeDefinition>> {
    return this._fetchObject(`/tasks/${id}`, TasksAdapter);
  }

  private _getFromServer(id: string): Observable<DataRequest<TaskNodeDefinition>> {
    if (id[0] === 't') {
      return this._fetchTaskDefinition(id);
    }

    return this._fetchTaskGroupDefinition(id);
  }

  private _getRecursive(id: string): Observable<TaskNodeDefinition> {
    return this._getFromServer(id).pipe(
      filter((res) => res.isLoading === false),
      filter((res) => res.error === undefined),
      map((res) => res.data as TaskNodeDefinition),
      mergeMap((parentWithChildIds) =>
        forkJoin([
          of(parentWithChildIds),
          ...(parentWithChildIds.childrenIds || []).map((childId) =>
            this._getRecursive(childId).pipe(),
          ),
        ]),
      ),
      tap(([parent, ...children]) => (parent.children = children)),
      map(([parent]) => parent),
    );
  }

  //===============================================================================================
  // Tickets

  fetchTickets(): Observable<DataRequest<Ticket[]>> {
    return this._fetchList(`/tickets`, TicketAdapter);
  }

  fetchTicket(ticketId: string): Observable<DataRequest<Ticket>> {
    return this._fetchObject(`/tickets/${ticketId}`, TicketAdapter);
  }

  createTicket(ticket: Ticket): Observable<DataRequest<Ticket>> {
    return this._createItem(`/tickets`, TicketAdapter, ticket);
  }

  updateTicket(ticket: Ticket): Observable<DataRequest<Ticket>> {
    if (!ticket.id) {
      throw 'Invalid parameters! Missing ID in ticket object.';
    }

    return this._updateItem(`/tickets/${ticket.id}`, TicketAdapter, ticket);
  }

  deleteTicket(ticketId: string): Observable<DataRequest<unknown>> {
    return this._deleteItem(`/tickets/${ticketId}`);
  }

  updateTicketActivity(ticketId: string, activityItems: TicketActivityItem[]) {
    return this._decorateRequest(
      this.http
        .patch<Ticket>(
          `${baseUrl}/tickets/${ticketId}`,
          { activityLog: activityItems },
          {
            headers: this._defaultHttpHeaders,
          },
        )
        .pipe(
          delay(fakeDelay),
          map((response) => ({ data: response })),
        ),
    );
  }

  updateTicketTasks(ticketId: string, tasksRoot: TicketTaskGroup) {
    return this._decorateRequest(
      this.http
        .patch<Ticket>(
          `${baseUrl}/tickets/${ticketId}`,
          { tasksRoot },
          {
            headers: this._defaultHttpHeaders,
          },
        )
        .pipe(
          delay(fakeDelay),
          map((response) => ({ data: response })),
        ),
    );
  }

  //===============================================================================================
  // WP Charts Data

  fetchWTLineSideData(deviceIds: string[], targetDate: Date): Observable<DataRequest<WTPowerData>> {
    let queryParams = `?targetDate=${DataAdapter.modelToDtoTimestamp(targetDate)}`;

    if (deviceIds.length > 0) {
      queryParams += this.queryStringForDeviceIds(deviceIds);
    }

    return this._fetchObject(`/wt-line-side-power${queryParams}`, WTDataAdapter);
  }

  fetchWTGeneratorSideData(
    deviceIds: string[],
    targetDate: Date,
  ): Observable<DataRequest<WTPowerData>> {
    let queryParams = `?targetDate=${DataAdapter.modelToDtoTimestamp(targetDate)}`;

    if (deviceIds.length > 0) {
      queryParams += this.queryStringForDeviceIds(deviceIds);
    }

    return this._fetchObject(`/wt-generator-side-power${queryParams}`, WTDataAdapter);
  }

  fetchWTCombinedChartData(
    deviceIds: string[],
    targetDate: Date,
  ): Observable<DataRequest<WTCombinedChartData>> {
    let queryParams = `?targetDate=${DataAdapter.modelToDtoTimestamp(targetDate)}`;

    if (deviceIds.length > 0) {
      queryParams += this.queryStringForDeviceIds(deviceIds);
    }

    return this._fetchObject(`/wt-combined-chart-data${queryParams}`, WTCombinedChartDataAdapter);
  }

  //===============================================================================================
  // Generic api methods

  public fetchList<DTO, Model>(
    endpoint: string,
    adapter?: DataAdapter<DTO, Model>,
  ): Observable<DataRequest<Model[]>> {
    return this._fetchList(endpoint, adapter);
  }

  public fetchObject<DTO, Model>(
    endpoint: string,
    adapter?: DataAdapter<DTO, Model>,
  ): Observable<DataRequest<Model>> {
    return this._fetchObject(endpoint, adapter);
  }

  public fetchObject_NoAdapter<DTO>(endpoint: string): Observable<DataRequest<DTO>> {
    return this._fetchObject(endpoint);
  }

  public patchItem<DTO, Model>(
    endpoint: string,
    patch: Partial<DTO>,
    adapter?: DataAdapter<DTO, Model>,
  ): Observable<DataRequest<Model>> {
    return this._patchItem(endpoint, patch, adapter);
  }

  public decorateRequest<T>(
    request: Observable<{ data: T; metadata?: ListMetadata }>,
  ): Observable<DataRequest<T>> {
    return this._decorateRequest(request);
  }

  public queryStringForDeviceIds(deviceIds: string[]): string {
    return deviceIds.map((deviceId) => `&deviceId=${deviceId}`).join(''); // join('') avoids added comma
  }

  public updateItem<DTO, Model>(
    endpoint: string,
    adapter: DataAdapter<DTO, Model>,
    item: Model,
  ): Observable<DataRequest<Model>> {
    return this._updateItem(endpoint, adapter, item);
  }

  public updateItem1<DTO, Model>(
    endpoint: string,
    adapter: DataAdapter<DTO, Model>,
    item: Model,
  ): Observable<DataRequest<Model>> {
    return this._updateItem1(endpoint, adapter, item);
  }

  public createItem<DTO, Model>(
    endpoint: string,
    adapter: DataAdapter<DTO, Model>,
    item: Model,
  ): Observable<DataRequest<Model>> {
    return this._createItem(endpoint, adapter, item);
  }

  public deleteItem(endpoint: string): Observable<DataRequest<unknown>> {
    return this._deleteItem(endpoint);
  }

  public handleError(err: unknown): HttpErrorResponse | Error {
    return this._handleError(err);
  }

  //===============================================================================================
  // Helpers

  private _fetchObject<DTO, Model>(
    endpoint: string,
    adapter?: DataAdapter<DTO, Model>,
  ): Observable<DataRequest<Model>> {
    return this._decorateRequest(
      this.http.get<DTO>(`${baseUrl}${endpoint}`, { observe: 'response' }).pipe(
        delay(fakeDelay),
        map((response) => {
          if (!response.body) {
            throw new EmptyContentError('Object not found / empty content.');
          }
          return response.body;
        }),
        tap((dto) => this._validateDto(dto, adapter)),
        map((dto) => ({ data: adapter ? adapter.dtoToModel(dto) : (dto as unknown as Model) })),
      ),
    );
  }

  private _fetchList<DTO, Model>(
    endpoint: string,
    adapter?: DataAdapter<DTO, Model>,
  ): Observable<DataRequest<Model[]>> {
    return this._decorateRequest(
      this.http.get<DTO[]>(`${baseUrl}${endpoint}`, { observe: 'response' }).pipe(
        delay(fakeDelay),
        map((response) => {
          const data = (response.body || []).map((dto) => {
            this._validateDto(dto, adapter);
            return adapter ? adapter.dtoToModel(dto) : (dto as unknown as Model);
          });

          return {
            data,
            metadata: {
              totalCount: Number(response.headers.get('X-Total-Count') || data.length),
            },
          };
        }),
      ),
    );
  }

  private _createItem<DTO, Model>(
    endpoint: string,
    adapter: DataAdapter<DTO, Model>,
    item: Model,
  ): Observable<DataRequest<Model>> {
    return this._decorateRequest(
      this.http
        .post<DTO>(`${baseUrl}${endpoint}`, adapter.modelToDto(item), {
          headers: this._defaultHttpHeaders,
        })
        .pipe(
          delay(fakeDelay),
          tap((response) => {
            this._validateDto(response, adapter);
            // TODO: double validation
            if (!response) {
              throw new Error($localize`Server returned empty response after creating an item!`);
            }
          }),
          map((response) => ({ data: adapter.dtoToModel(response) })),
        ),
    );
  }

  private _updateItem<DTO, Model>(
    endpoint: string,
    adapter: DataAdapter<DTO, Model>,
    item: Model,
  ): Observable<DataRequest<Model>> {
    return this._decorateRequest(
      this.http
        .put<DTO>(`${baseUrl}${endpoint}`, adapter.modelToDto(item), {
          headers: this._defaultHttpHeaders,
        })
        .pipe(
          delay(fakeDelay),
          tap((response) => {
            this._validateDto(response, adapter);
            // TODO: double validation
            if (!response) {
              throw new Error($localize`Server returned empty response after updating an item!`);
            }
          }),
          map((response) => ({ data: adapter.dtoToModel(response) })),
        ),
    );
  }

  private _updateItem1<DTO, Model>(
    endpoint: string,
    adapter: DataAdapter<DTO, Model>,
    item: Model,
  ): Observable<DataRequest<Model>> {
    return this._decorateRequest(
      //  empty response
      this.http
        .put<DTO>(`${baseUrl}${endpoint}`, adapter.modelToDto(item), {
          headers: this._defaultHttpHeaders,
        })
        .pipe(
          delay(fakeDelay),
          map((response) => ({ data: item })),
        ),
    );
  }

  private _patchItem<DTO, Model>(
    endpoint: string,
    patch: Partial<DTO>,
    adapter?: DataAdapter<DTO, Model>,
  ): Observable<DataRequest<Model>> {
    return this._decorateRequest(
      this.http
        .patch<DTO>(`${baseUrl}${endpoint}`, patch, {
          headers: this._defaultHttpHeaders,
        })
        .pipe(
          delay(fakeDelay),
          tap((response) => {
            this._validateDto(response, adapter);
            // TODO: double validation
            if (!response) {
              throw new Error($localize`Server returned empty response after updating an item!`);
            }
          }),
          map((response) => ({
            data: adapter ? adapter.dtoToModel(response) : (response as unknown as Model),
          })),
        ),
    );
  }

  private _deleteItem(endpoint: string): Observable<DataRequest<unknown>> {
    return this._decorateRequest(
      this.http
        .delete(`${baseUrl}${endpoint}`, {
          headers: this._defaultHttpHeaders,
        })
        .pipe(
          delay(fakeDelay),
          map((response) => ({ data: response })),
        ),
    );
  }

  private _decorateRequest<T>(
    request: Observable<{ data: T; metadata?: ListMetadata }>,
  ): Observable<DataRequest<T>> {
    return request.pipe(
      map((obj) => ({ isLoading: false, data: obj.data, listMetadata: obj.metadata })),
      startWith({ isLoading: true }),
      catchError((error: unknown) => of({ isLoading: false, error: this._handleError(error) })),
      // shareReplay(1) shareReply will prevent http request cancelation when using switch map
    );
  }

  private _validateDto<DTO, Model>(dto: DTO, adapter?: DataAdapter<DTO, Model>) {
    return;
    // try {
    //   const validator = adapter.validator();
    //   if (!validator) {
    //     return;
    //   }

    //   if (!validator(dto)) {
    //     console.warn('AJV validator — Server returned invalid data!', dto, validator.errors);
    //   }
    // } catch (err) {
    //   console.error('AJV ERROR!', dto, err);
    // }
  }

  private _handleError(err: unknown): HttpErrorResponse | Error {
    return handleAnyError(err, undefined);
  }
}
