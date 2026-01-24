import {
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  IsObject,
} from 'class-validator';
import { MatchStatus } from '../entities/match.entity';

export class CreateMatchDto {
  @IsString()
  homeTeam: string;

  @IsString()
  awayTeam: string;

  @IsDateString()
  startTime: Date;

  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsString()
  league?: string;

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @IsNumber()
  @Min(1.01, { message: 'Home odds must be at least 1.01' })
  homeOdds?: number;

  @IsOptional()
  @IsNumber()
  @Min(1.01, { message: 'Draw odds must be at least 1.01' })
  drawOdds?: number;

  @IsOptional()
  @IsNumber()
  @Min(1.01, { message: 'Away odds must be at least 1.01' })
  awayOdds?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
