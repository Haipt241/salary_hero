import { Test, TestingModule } from '@nestjs/testing';
import * as cron from 'node-cron';
import { ScheduleService } from './schedule.service';
import { UserService } from './user.service';

jest.mock('node-cron', () => ({
    schedule: jest.fn(),
}));

describe('ScheduleService', () => {
    let service: ScheduleService;
    let userServiceMock: any;

    beforeEach(async () => {
        userServiceMock = {
            updateBalancesNow: jest.fn().mockResolvedValue(undefined),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ScheduleService,
                { provide: UserService, useValue: userServiceMock },
            ],
        }).compile();

        service = module.get<ScheduleService>(ScheduleService);
    });

    it('should schedule updateBalancesNow to be called daily at midnight', async () => {
        service.onModuleInit(); // Manually trigger initialization
        expect(cron.schedule).toHaveBeenCalledWith('0 0 * * *', expect.any(Function));

        const scheduleCall = (cron.schedule as jest.Mock).mock.calls[0][1];
        await scheduleCall();
        expect(userServiceMock.updateBalancesNow).toHaveBeenCalled();
    });
});
