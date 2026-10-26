import { IsNotEmpty, IsDateString } from 'class-validator';

export class FlightHoursQueryDto {
  @IsNotEmpty()
  @IsDateString()
  from!: string;

  @IsNotEmpty()
  @IsDateString()
  to!: string;
}

export class FlightHoursSummaryQueryDto {
  range?: '1w' | '1m' | '3m' | '6m' | '1y';
}
