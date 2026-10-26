import { Controller, Get, Query, ValidationPipe, UsePipes } from '@nestjs/common';
import { SchedulesService } from './schedules.service.js';
import { SchedulesQueryDto } from './dto/schedules-query.dto.js';

@Controller('schedules')
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getSchedules(@Query() query: SchedulesQueryDto) {
    return this.schedulesService.getSchedules(query.year, query.month);
  }
}
