import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Balance } from './balance.entity';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum TransactionSource {
  BET = 'BET',
  STAKE = 'STAKE',
  REWARD = 'REWARD',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

@Entity('balance_transactions')
@Index(['balanceId'])
@Index(['type'])
@Index(['source'])
@Index(['referenceId'])
export class BalanceTransaction extends BaseEntity {
  @Column({ name: 'balance_id' })
  balanceId: string;

  @ManyToOne(() => Balance, (balance) => balance.transactions)
  balance: Balance;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionSource,
  })
  source: TransactionSource;

  @Column({ name: 'reference_id', nullable: true })
  referenceId: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({
    name: 'previous_balance',
    type: 'decimal',
    precision: 18,
    scale: 8,
    nullable: true,
  })
  previousBalance: number;

  @Column({
    name: 'new_balance',
    type: 'decimal',
    precision: 18,
    scale: 8,
    nullable: true,
  })
  newBalance: number;
}
