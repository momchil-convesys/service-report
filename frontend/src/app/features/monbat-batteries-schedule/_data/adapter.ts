import { Plant } from '../../../data/models';
import { MonbatPowerLimitScheduleDTO } from './dto';
import { MonbatSchedule } from './models';

export function adaptSchedule(dto: MonbatPowerLimitScheduleDTO, plant: Plant): MonbatSchedule {
  return dto;
}
