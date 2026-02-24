import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserAchievement } from './user-achievement.entity';

export enum TriggerEvent {
  BET_SETTLED = 'BET_SETTLED',
  SPIN_RESULT = 'SPIN_RESULT',
  STAKING_EVENT = 'STAKING_EVENT',
  LEADERBOARD_UPDATE = 'LEADERBOARD_UPDATE',
  // Can be extended with more events in the future
}

export enum RuleType {
  COUNT = 'COUNT',                 // Count frequency (e.g., place 10 bets)
  SUM_AMOUNT = 'SUM_AMOUNT',       // Sum specific fields (e.g., total stake > 1000)
  SPECIFIC_CONDITION = 'SPECIFIC', // specific conditions from metadata, like 'WIN', 'JACKPOT'
}

@Entity('achievements')
export class Achievement extends BaseEntity {
  @Column({ unique: true })
  @Index()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TriggerEvent,
  })
  @Index()
  triggerEvent: TriggerEvent;

  @Column({
    type: 'enum',
    enum: RuleType,
    default: RuleType.COUNT,
  })
  ruleType: RuleType;

  // The condition to meet
  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  targetValue: number;

  // Additional match filters e.g. { outcome: 'WON' } for specific bets, or { specificTier: 'GOLD' }
  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column('int', { default: 0 })
  rewardPoints: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @OneToMany(() => UserAchievement, (userAchievement) => userAchievement.achievement)
  userAchievements: UserAchievement[];
}
