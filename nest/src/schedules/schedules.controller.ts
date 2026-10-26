import { Controller, Get, Query } from '@nestjs/common';
import { DataStoreService } from '../common/data-store.service.js';

@Controller('schedules')
export class SchedulesController {
  constructor(private dataStore: DataStoreService) {}

  @Get()
  getSchedules(@Query('year') year: string, @Query('month') month: string) {
    const schData = this.dataStore.getSchedulesData();
    let schedules = schData.schedules || [];

    if (year && month) {
      const prefix = `${year}-${month.padStart(2, '0')}`;
      schedules = schedules.filter((s: any) => s.duty_date && s.duty_date.startsWith(prefix));
    }

    return {
      legend: schData.legend || [],
      schedules,
    };
  }
}
