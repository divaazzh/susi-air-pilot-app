import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SchedulesQueryDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'year must be a 4-digit number (YYYY)' })
  year!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(0[1-9]|1[0-2]|\d{1,2})$/, { message: 'month must be between 01 and 12' })
  month!: string;
}
