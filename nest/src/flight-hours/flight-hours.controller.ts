import { Controller, Get, Query, ValidationPipe, UsePipes } from '@nestjs/common';
import { FlightHoursService } from './flight-hours.service.js';
import { FlightHoursQueryDto, FlightHoursSummaryQueryDto } from './dto/flight-hours-query.dto.js';

@Controller('flight-hours')
export class FlightHoursController {
  constructor(private flightHoursService: FlightHoursService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getFlightHours(@Query() query: FlightHoursQueryDto) {
    return this.flightHoursService.getFlightHoursInRange(query.from, query.to);
  }

  @Get('summary')
  getSummary(@Query() query: FlightHoursSummaryQueryDto) {
    const validRange = ['1w', '1m', '3m', '6m', '1y'].includes(query.range || '')
      ? query.range!
      : '1w';
    return this.flightHoursService.rollingWindowBluffing(validRange);
  }
}
