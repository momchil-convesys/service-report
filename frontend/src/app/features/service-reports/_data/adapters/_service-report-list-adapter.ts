import { AnyValidateFunction } from 'ajv/dist/types';
import { ServiceReportListDto } from '../dtos/_service-reports.dto';
//import { ServiceReportListDto } from '../../../../data/dtos';

class ServiceReportListAdapterClass {
  dtoToModel(dto: ServiceReportListDto) {
    return {
      ...dto,
    };
  }

  modelToDto(model: any): any {
    throw new Error($localize`Method not implemented.`);
  }

  validator(): AnyValidateFunction<any> | undefined {
    // TODO: validator
    return undefined;
  }
}

export const ServiceReportListAdapter = new ServiceReportListAdapterClass();
