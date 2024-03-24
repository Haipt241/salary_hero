import * as mongoose from 'mongoose';
import {UserSchema} from '../src/models/user.schema';
import {NestFactory} from "@nestjs/core";
import {AppModule} from "../src/app.module";
import {UserService} from "../src/user/user.service";

const User = mongoose.model('User', UserSchema);

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const userService = app.get(UserService);
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
    const fortyFiveDaysAgo = new Date(new Date().setDate(new Date().getDate() - 45));
    const users = [
        {
            name: 'User1',
            email: 'u1@example.com',
            baseSalary: 3000,
            employeeType: 'monthly',
            startDate: thirtyDaysAgo,
            balance: calculateBalance(3000, 0, fortyFiveDaysAgo, 'monthly'),
        },
        {
            name: 'User2',
            email: 'u2@example.com',
            dailyRate: 200,
            startDate: thirtyDaysAgo,
            employeeType: 'daily',
            balance: calculateBalance(0, 200, thirtyDaysAgo, 'daily'),
        }
    ];

    for (const user of users) {
        const currentUser = await userService.findUserByEmail(user.email);
        if (currentUser) {
            await userService.deleteBalanceHistoryByUserId(currentUser._id);
            await userService.deleteByEmail(user.email);
        }
        const createdUser = await userService.create(user);
    }

    console.log('Seed data has been inserted');

    await app.close();
}

function calculateBalance(baseSalary: number, dailyRate: number, startDate: Date, employeeType: 'monthly' | 'daily'): number {
    const currentDate = new Date();
    const yesterdayDate = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000));
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysWorked = Math.floor((yesterdayDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

    if (employeeType === 'monthly') {
        return Math.round((baseSalary / daysInMonth) * daysWorked);
    } else if (employeeType === 'daily') {
        return dailyRate * daysWorked;
    } else {
        throw new Error('Invalid employee type');
    }
}

seed().catch((error) => {
    console.error('Failed to seed database', error);
    process.exit(1);
});
