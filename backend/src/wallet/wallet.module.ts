import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { Balance } from './entities/balance.entity';
import { BalanceTransaction } from './entities/balance-transaction.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Balance, BalanceTransaction, User])],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
