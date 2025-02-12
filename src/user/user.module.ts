import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../models/user.schema';
import { BalanceHistorySchema } from "../models/balanceHistory.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
        { name: 'User', schema: UserSchema },
        { name: 'BalanceHistory', schema: BalanceHistorySchema }
    ])
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController]
})
export class UserModule {}
