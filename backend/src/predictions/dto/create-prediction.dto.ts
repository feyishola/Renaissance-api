import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { MatchOutcome } from '../../matches/entities/match.entity';

export class CreatePredictionDto {
  @IsNotEmpty()
  @IsUUID()
  matchId: string;

  @IsNotEmpty()
  @IsEnum(MatchOutcome)
  predictedOutcome: MatchOutcome;
}
