import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { BalanceTransaction } from './balance-transaction.entity';

@Entity('balances')
@Index(['userId'])
export class Balance extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'available_balance',
    type: 'decimal',
    precision: 18,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  availableBalance: number;

  @Column({
    name: 'locked_balance',
    type: 'decimal',
    precision: 18,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  lockedBalance: number;

  @OneToMany(() => BalanceTransaction, (transaction) => transaction.balance)
  transactions: BalanceTransaction[];
}
