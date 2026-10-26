import { Module } from '@nestjs/common';
import { LogbookController } from './logbook.controller.js';

@Module({
  controllers: [LogbookController],
})
export class LogbookModule {}
