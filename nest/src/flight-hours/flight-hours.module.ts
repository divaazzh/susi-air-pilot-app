import { Module } from '@nestjs/common';
import { FlightHoursController } from './flight-hours.controller.js';

@Module({
  controllers: [FlightHoursController],
})
export class FlightHoursModule {}
