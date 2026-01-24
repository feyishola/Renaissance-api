import { IsUUID, IsNumber, IsEnum, IsPositive, Min } from 'class-validator';
import { MatchOutcome } from '../../matches/entities/match.entity';

export class CreateBetDto {
  @IsUUID()
  matchId: string;

  @IsNumber()
  @IsPositive()
  @Min(0.00000001, { message: 'Stake amount must be greater than 0' })
  stakeAmount: number;

  @IsEnum(MatchOutcome, {
    message: 'predictedOutcome must be one of: home_win, away_win, draw',
  })
  predictedOutcome: MatchOutcome;
}
