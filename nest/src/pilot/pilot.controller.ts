import { Controller, Get, Req } from '@nestjs/common';
import { DataStoreService } from '../common/data-store.service.js';

@Controller('pilot')
export class PilotController {
  constructor(private dataStore: DataStoreService) {}

  @Get('me')
  getPilotMe() {
    const fhData = this.dataStore.getFlightHoursData();
    const pilot = fhData.pilot || { name: 'John Doe', totalFlightHours: 1444.5 };
    return {
      name: pilot.name,
      totalFlightHours: pilot.totalFlightHours,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    };
  }
}
