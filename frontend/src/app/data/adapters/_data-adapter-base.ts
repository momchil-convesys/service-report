import { AnyValidateFunction } from 'ajv/dist/core';
import { utcToZonedTimeSafe } from '../../helpers';

const schemaName = 'API_SCHEMA';
const objectSchemaBasePath = `${schemaName}#/components/schemas`;

export const objectSchemaPaths = {
  Plant: `${objectSchemaBasePath}/Plant`,
  Device: `${objectSchemaBasePath}/Device`,
  Ticket: `${objectSchemaBasePath}/Ticket`,
  Tasks: `${objectSchemaBasePath}/Tasks`,
  DeviceMetrics: `${objectSchemaBasePath}/DeviceMetrics`,
  Fault: `${objectSchemaBasePath}/Fault`,
  FaultGroup: `${objectSchemaBasePath}/FaultGroup`,
  FaultsDefinitionSet: `${objectSchemaBasePath}/FaultsDefinitionSet`,
  ErrorStack: `${objectSchemaBasePath}/ErrorStack`,
};

// export const ajvInstance = new Ajv({ strict: false, allErrors: false, allowUnionTypes: true });
// ajvInstance.addSchema(schema, schemaName);

export abstract class DataAdapter<DTO, Model> {
  abstract dtoToModel(dto: DTO, ...args: unknown[]): Model;
  abstract modelToDto(model: Model): DTO;
  abstract validator(): AnyValidateFunction<DTO> | undefined;

  static modelToDtoTimestamp(modelTimestamp: Date): string {
    return modelTimestamp.toISOString();
  }

  static dtoToModelTimestamp(dtoTimestamp: string): Date {
    const parsedDate = Date.parse(dtoTimestamp);

    if (isNaN(parsedDate)) {
      throw new Error($localize`Server returned invalid timestamp:` + ` ${dtoTimestamp}`);
    }

    return new Date(parsedDate);
  }

  static dtoToModelTimestamp_Zoned(dtoTimestamp: string, timeZone: string | undefined): Date {
    const parsedDate = DataAdapter.dtoToModelTimestamp(dtoTimestamp);

    return utcToZonedTimeSafe(parsedDate, timeZone);
  }
}
