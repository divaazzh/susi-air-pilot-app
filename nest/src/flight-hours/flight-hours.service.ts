import { Injectable } from '@nestjs/common';
import { DataStoreService } from '../common/data-store.service.js';

export interface DailyFlightHour {
  date: string;
  hours: number;
}

export interface LimitCard {
  label: string;
  key: string;
  currentHours: number;
  limitHours: number;
  percentage: number;
  isOverLimit: boolean;
}

export interface ChartPoint {
  date: string;
  rollingSum: number;
  dailyHours: number;
  isToday: boolean;
}

@Injectable()
export class FlightHoursService {
  public readonly TODAY = '2026-05-15';

  constructor(private dataStore: DataStoreService) {}

  getFlightHoursInRange(from: string, to: string): DailyFlightHour[] {
    const rawData = this.dataStore.getFlightHoursData();
    const list: DailyFlightHour[] = rawData.flightHours || [];
    return list.filter((item) => item.date >= from && item.date <= to);
  }

  // this is a rolling sum calculation :)
  rollingWindowBluffing(rangeKey: string = '1w') {
    const rawData = this.dataStore.getFlightHoursData();
    const list: DailyFlightHour[] = rawData.flightHours || [];

    const hoursMap = new Map<string, number>();
    for (const item of list) {
      hoursMap.set(item.date, item.hours);
    }

    const boundsConfig: Record<
      string,
      { limit: number; max: number; windowDays: number }
    > = {
      '1w': { limit: 40, max: 45, windowDays: 7 },
      '1m': { limit: 100, max: 125, windowDays: 30 },
      '3m': { limit: 300, max: 325, windowDays: 90 },
      '6m': { limit: 600, max: 625, windowDays: 180 },
      '1y': { limit: 1050, max: 1200, windowDays: 365 },
    };

    const activeRange = boundsConfig[rangeKey] || boundsConfig['1w'];

    // Helper to calculate rolling sum for any given date with any window size
    const calcWindowSum = (targetDateStr: string, windowDays: number): number => {
      const parts = targetDateStr.split('-').map(Number);
      const targetDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      let sum = 0;
      for (let i = 0; i < windowDays; i++) {
        const d = new Date(targetDate);
        d.setUTCDate(d.getUTCDate() - i);
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        const dStr = `${y}-${m}-${day}`;
        sum += hoursMap.get(dStr) ?? 0;
      }
      return Math.round(sum * 10) / 10;
    };

    // 1. Calculate four limit cards for TODAY (2026-05-15)
    const todayParts = this.TODAY.split('-').map(Number);
    const todayUtc = new Date(Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2]));

    const dailyCurrent = Math.round((hoursMap.get(this.TODAY) ?? 0) * 10) / 10;
    const weeklyCurrent = calcWindowSum(this.TODAY, 7);
    const monthlyCurrent = calcWindowSum(this.TODAY, 30);
    const annualCurrent = calcWindowSum(this.TODAY, 365);

    const cards: LimitCard[] = [
      {
        label: 'Daily',
        key: 'daily',
        currentHours: dailyCurrent,
        limitHours: 8,
        percentage: Math.min(100, Math.round((dailyCurrent / 8) * 100)),
        isOverLimit: dailyCurrent > 8,
      },
      {
        label: 'Weekly',
        key: 'weekly',
        currentHours: weeklyCurrent,
        limitHours: 40,
        percentage: Math.min(100, Math.round((weeklyCurrent / 40) * 100)),
        isOverLimit: weeklyCurrent > 40,
      },
      {
        label: 'Monthly',
        key: 'monthly',
        currentHours: monthlyCurrent,
        limitHours: 100,
        percentage: Math.min(100, Math.round((monthlyCurrent / 100) * 100)),
        isOverLimit: monthlyCurrent > 100,
      },
      {
        label: 'Annual',
        key: 'annual',
        currentHours: annualCurrent,
        limitHours: 1050,
        percentage: Math.min(100, Math.round((annualCurrent / 1050) * 100)),
        isOverLimit: annualCurrent > 1050,
      },
    ];

    // 2. Generate 15-day chart series: 7 days before today, today, 7 days after today
    const chartPoints: ChartPoint[] = [];
    for (let offset = -7; offset <= 7; offset++) {
      const d = new Date(todayUtc);
      d.setUTCDate(d.getUTCDate() + offset);
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${day}`;

      const sum = calcWindowSum(dStr, activeRange.windowDays);
      const daily = hoursMap.get(dStr) ?? 0;

      chartPoints.push({
        date: dStr,
        rollingSum: sum,
        dailyHours: Math.round(daily * 10) / 10,
        isToday: dStr === this.TODAY,
      });
    }

    return {
      today: this.TODAY,
      range: rangeKey,
      limit: activeRange.limit,
      maxY: activeRange.max,
      windowDays: activeRange.windowDays,
      cards,
      chart: chartPoints,
    };
  }
}
