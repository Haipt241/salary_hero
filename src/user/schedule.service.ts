import * as cron from 'node-cron';
import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';

@Injectable()
export class ScheduleService {
    constructor(private userService: UserService) {}

    onModuleInit() {
        this.updateBalancesDaily();
    }
    updateBalancesDaily() {
        cron.schedule('0 0 * * *', async () => {
            await this.userService.updateBalancesNow();
        });
        console.log('Updated balances for all users');
    };
}
