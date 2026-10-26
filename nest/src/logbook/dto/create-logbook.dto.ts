import { IsNotEmpty, IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateLogbookDto {
  @IsNotEmpty()
  @IsString()
  date!: string;

  @IsNotEmpty()
  @IsString()
  aircraftType!: string;

  @IsNotEmpty()
  @IsString()
  tailNumber!: string;

  @IsNotEmpty()
  @IsString()
  departure!: string;

  @IsNotEmpty()
  @IsString()
  arrival!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.1)
  @Max(8.0)
  flightHours!: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
