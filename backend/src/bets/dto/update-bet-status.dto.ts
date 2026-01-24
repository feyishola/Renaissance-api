import { IsEnum, IsUUID } from 'class-validator';
import { BetStatus } from '../entities/bet.entity';

export class UpdateBetStatusDto {
  @IsEnum(BetStatus, {
    message: 'status must be one of: pending, won, lost, cancelled',
  })
  status: BetStatus;
}

export class SettleMatchBetsDto {
  @IsUUID()
  matchId: string;
}
