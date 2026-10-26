import mockFlightHours from '~/data/mock-flight-hours.json';
import mockDocuments from '~/data/mock-documents.json';
import mockSchedules from '~/data/mock-schedules.json';

const TODAY = '2026-05-15';

export class ClientFlightService {
  // this is a rolling sum calculation :)
  static rollingWindowBluffing(rangeKey: string = '1w') {
    const list = mockFlightHours.flightHours || [];
    const hoursMap = new Map<string, number>();
    for (const item of list) {
      hoursMap.set(item.date, item.hours);
    }

    const boundsConfig: Record<string, { limit: number; max: number; windowDays: number }> = {
      '1w': { limit: 40, max: 45, windowDays: 7 },
      '1m': { limit: 100, max: 125, windowDays: 30 },
      '3m': { limit: 300, max: 325, windowDays: 90 },
      '6m': { limit: 600, max: 625, windowDays: 180 },
      '1y': { limit: 1050, max: 1200, windowDays: 365 },
    };

    const activeRange = boundsConfig[rangeKey] || boundsConfig['1w'];

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

    const todayParts = TODAY.split('-').map(Number);
    const todayUtc = new Date(Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2]));

    const dailyCurrent = Math.round((hoursMap.get(TODAY) ?? 0) * 10) / 10;
    const weeklyCurrent = calcWindowSum(TODAY, 7);
    const monthlyCurrent = calcWindowSum(TODAY, 30);
    const annualCurrent = calcWindowSum(TODAY, 365);

    const cards = [
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

    const chartPoints = [];
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
        isToday: dStr === TODAY,
      });
    }

    return {
      today: TODAY,
      range: rangeKey,
      limit: activeRange.limit,
      maxY: activeRange.max,
      windowDays: activeRange.windowDays,
      cards,
      chart: chartPoints,
    };
  }

  static getDocuments() {
    const docs = mockDocuments.documents || [];
    const warningDays = mockDocuments.thresholds?.warningDays ?? 30;

    const todayParts = TODAY.split('-').map(Number);
    const todayDate = new Date(Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2]));

    const items = docs.map((doc: any) => {
      const expParts = doc.expiryDate.split('-').map(Number);
      const expDate = new Date(Date.UTC(expParts[0], expParts[1] - 1, expParts[2]));
      const diffTime = expDate.getTime() - todayDate.getTime();
      const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let status: 'safe' | 'soon' | 'expired' = 'safe';
      let color: 'green' | 'amber' | 'red' = 'green';

      if (daysRemaining <= 0) {
        status = 'expired';
        color = 'red';
      } else if (daysRemaining <= warningDays) {
        status = 'soon';
        color = 'amber';
      } else {
        status = 'safe';
        color = 'green';
      }

      return {
        id: doc.id,
        label: doc.label,
        expiryDate: doc.expiryDate,
        daysRemaining,
        status,
        color,
      };
    });

    return {
      today: TODAY,
      warningDays,
      documents: items,
    };
  }

  static getSchedules(year: number, month: number) {
    const schedules = mockSchedules.schedules || [];
    const legend = mockSchedules.legend || [];
    const fieldGuide = mockSchedules.fieldGuide || {};

    const formattedMonth = String(month).padStart(2, '0');
    const ymPrefix = `${year}-${formattedMonth}`;
    const monthSchedules = schedules.filter((s) => s.duty_date.startsWith(ymPrefix));

    return {
      today: TODAY,
      year: String(year),
      month: formattedMonth,
      count: monthSchedules.length,
      fieldGuide,
      legend,
      schedules: monthSchedules,
    };
  }
}
