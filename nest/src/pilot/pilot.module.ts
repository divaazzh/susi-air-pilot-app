import { Module } from '@nestjs/common';
import { PilotController } from './pilot.controller.js';

@Module({
  controllers: [PilotController],
})
export class PilotModule {}
