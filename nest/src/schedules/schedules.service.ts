import { Injectable } from '@nestjs/common';
import { DataStoreService } from '../common/data-store.service.js';

export interface ScheduleItem {
  id: string;
  duty_date: string;
  status: number;
  base_name: string;
  base_color: string;
  duty_type: string;
  count_schedules: number;
  count_logbooks: number;
}

@Injectable()
export class SchedulesService {
  public readonly TODAY = '2026-05-15';

  constructor(private dataStore: DataStoreService) {}

  getSchedules(year: string, month: string) {
    const rawData = this.dataStore.getSchedulesData();
    const schedules: ScheduleItem[] = rawData.schedules || [];
    const legend = rawData.legend || [];
    const fieldGuide = rawData.fieldGuide || {};

    const formattedMonth = String(parseInt(month, 10)).padStart(2, '0');
    const ymPrefix = `${year}-${formattedMonth}`;

    const monthSchedules = schedules.filter((s) => s.duty_date.startsWith(ymPrefix));

    return {
      today: this.TODAY,
      year,
      month: formattedMonth,
      count: monthSchedules.length,
      fieldGuide,
      legend,
      schedules: monthSchedules,
    };
  }
}
