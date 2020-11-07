import { EventType, IncrementalSource } from '@mood/record/constant';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ReportQueryDTO {
  @IsString()
  @IsOptional()
  domain?: string;

  @IsString()
  @IsOptional()
  uid?: string;

  @IsString()
  @IsOptional()
  session?: string;

  @IsNumber()
  @IsOptional()
  type?: EventType;

  @IsNumber()
  @IsOptional()
  source?: IncrementalSource;

  @IsNumber()
  @IsOptional()
  skip?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}
