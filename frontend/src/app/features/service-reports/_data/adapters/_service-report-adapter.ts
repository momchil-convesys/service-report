import { AnyValidateFunction } from 'ajv/dist/types';
import { ServiceReportDto, ServiceRreportSaveDto } from '../dtos/_service-reports.dto';
//import { ServiceReportDto, ServiceRreportSaveDto } from '../../../../data/dtos';

class ServiceReportAdapterClass {
  dtoToModel(dto: ServiceReportDto) {
    //console.log(dto);
    const plant = dto.plant || {};
    const device = dto.device || {};
    const userPlants = dto.userPlants || [];
    const devices = plant.devices || userPlants.find((item: any) => item.id === dto.plantId)?.devices || [];

    return {
      // ...dto,
      travelling: dto.travelling,
      works: dto.works,
      materials: dto.materials,

      genericObj: {
        plantId: dto.plantId + '',
        deviceId: dto.deviceId,
        statusReport: dto.statusReport,
        complaintNumber: dto.complaintNumber,
        otherEquipment: dto.otherEquipment,
        plantName: plant.name || dto['plantName'],
        country: plant.country || dto.country,
        inverterType: device.type || dto.inverterType,
        installedPowerKw: device.installedPowerKw || dto['installedPowerKw'],
        deviceSerialNumber: device.serialNumber || dto['deviceSerialNumber'],
        contractNumber: dto.contractNumber,
        warrantyStatus: dto.warrantyStatus,
        ...this.typeActivityModel(dto.typeActivity),
      },
      id: dto.id,
      plant,
      device,
      userId: dto['userId'],
      user: dto['user'],
      userPlants,
      userClient: dto.userClient,
      devices,
    };
  }

  modelToDto(model: any): ServiceRreportSaveDto {
    console.log('modelToDto model', model);
    const dto = {
      ...model,
      id: model.id,
      plantId: model.genericObj.plantId,
      deviceId: model.genericObj.deviceId,
      statusReport: model.genericObj.statusReport,
      complaintNumber: model.genericObj.complaintNumber,
      otherEquipment: model.genericObj.otherEquipment,
      ...this.typeActivityDto(model.genericObj.typeActivity),
    };
    console.log('modelToDto dto', dto);
    return dto;
  }

  validator(): AnyValidateFunction<any> | undefined {
    // TODO: validator
    return undefined;
  }
  private typeActivityDto(typeActivityModel: any) {
    let typeActivityDto: any = {};
    if (typeActivityModel) {
      // console.log('typeActivityModel', typeActivityModel);
      (typeActivityModel || []).forEach((obj: any) => {
        // console.log('obj', obj);
        typeActivityDto[obj] = true;
      });
    } else {
      typeActivityDto = {};
    }
    return {
      typeActivity: typeActivityDto,
    };
  }

  private typeActivityModel(typeActivity: any) {
    //console.log('typeActivity', typeActivity);
    let typeActivityReady: any[];

    if (typeActivity) {
      typeActivityReady = Object.keys(typeActivity).filter(
        (key) => typeActivity[key],
        //  return { label: key, value: key, checked: typeActivity[key] };
      );
    } else {
      typeActivityReady = [];
    }
    return {
      typeActivity: typeActivityReady,
    };
  }
}

export const ServiceReportAdapter = new ServiceReportAdapterClass();
