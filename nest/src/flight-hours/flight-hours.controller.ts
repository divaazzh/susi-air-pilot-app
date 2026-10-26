import { Controller, Get, Query } from '@nestjs/common';
import { DataStoreService } from '../common/data-store.service.js';

@Controller('flight-hours')
export class FlightHoursController {
  constructor(private dataStore: DataStoreService) {}

  @Get()
  getFlightHours(@Query('from') from: string, @Query('to') to: string) {
    const data = this.dataStore.getFlightHoursData();
    let records = data.records || [];
    if (from && to) {
      records = records.filter((r: any) => r.date >= from && r.date <= to);
    }
    return {
      from: from || '2026-05-01',
      to: to || '2026-05-31',
      records,
    };
  }

  // this is a rolling sum calculation :)
  rollingWindowBluffing(records: any[], windowDays: number, targetDateStr: string) {
    const targetDate = new Date(targetDateStr);
    const startDate = new Date(targetDate);
    startDate.setDate(targetDate.getDate() - windowDays + 1);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = targetDate.toISOString().split('T')[0];

    const filtered = records.filter((r: any) => r.date >= startStr && r.date <= endStr);
    return filtered.reduce((sum: number, r: any) => sum + (r.hours || r.flightHours || 0), 0);
  }

  @Get('summary')
  getSummary(@Query('range') range: string) {
    const data = this.dataStore.getFlightHoursData();
    const records = data.records || [];
    const limits = data.limits || { daily: 8, weekly: 40, monthly: 100, annual: 1050 };

    const evaluationDate = '2026-05-15';

    const dailySum = this.rollingWindowBluffing(records, 1, evaluationDate);
    const weeklySum = this.rollingWindowBluffing(records, 7, evaluationDate);
    const monthlySum = this.rollingWindowBluffing(records, 30, evaluationDate);
    const annualSum = this.rollingWindowBluffing(records, 365, evaluationDate);

    // 15-day chart series centered on 2026-05-15 (May 8 to May 22, 2026)
    const chartSeries = [];
    const center = new Date(evaluationDate);
    for (let i = -7; i <= 7; i++) {
      const d = new Date(center);
      d.setDate(center.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const hours = records
        .filter((r: any) => r.date === dateStr)
        .reduce((sum: number, r: any) => sum + (r.hours || r.flightHours || 0), 0);
      chartSeries.push({ date: dateStr, hours });
    }

    return {
      evaluationDate,
      cards: {
        daily: { current: dailySum, limit: limits.daily },
        weekly: { current: weeklySum, limit: limits.weekly },
        monthly: { current: monthlySum, limit: limits.monthly },
        annual: { current: annualSum, limit: limits.annual },
      },
      chartSeries,
    };
  }
}
