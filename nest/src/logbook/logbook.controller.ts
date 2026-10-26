import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { DataStoreService } from '../common/data-store.service.js';
import { CreateLogbookDto } from './dto/create-logbook.dto.js';

@Controller('logbook')
export class LogbookController {
  private inMemoryLogs: any[] = [];

  constructor(private dataStore: DataStoreService) {}

  @Get()
  getLogbook() {
    const fhData = this.dataStore.getFlightHoursData();
    const records = fhData.records || [];
    // Combine base records and in-memory logs
    return [...records, ...this.inMemoryLogs];
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createLog(@Body() dto: CreateLogbookDto) {
    const newLog = {
      id: 'log_' + Date.now(),
      ...dto,
      createdAt: new Date().toISOString(),
    };
    this.inMemoryLogs.push(newLog);

    // Update pilot total flight hours in dataStore in-memory
    const fhData = this.dataStore.getFlightHoursData();
    if (fhData.pilot) {
      fhData.pilot.totalFlightHours = (fhData.pilot.totalFlightHours || 0) + dto.flightHours;
    }

    return {
      message: 'Logbook entry created successfully',
      entry: newLog,
      updatedTotalHours: fhData.pilot?.totalFlightHours,
    };
  }
}
