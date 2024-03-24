import {User} from "../models/user.schema";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Injectable} from "@nestjs/common";
import {BalanceHistory} from "../models/balanceHistory.schema";

@Injectable()
export class UserService {
    constructor(
        // Injects the Mongoose models for User and BalanceHistory to interact with the database.
        @InjectModel('User') private userModel: Model<User>,
        @InjectModel('BalanceHistory') private balanceHistoryModel: Model<BalanceHistory>,
    ) {}

    /**
     * Creates a new user based on the provided user data (DTO) and creates an initial balance history record.
     * @param createUserDto Data Transfer Object containing the new user's information.
     * @returns The newly created user document.
     */
    async create(createUserDto: any): Promise<User> {
        const newUser = await this.userModel.create(createUserDto);

        await this.balanceHistoryModel.create({
            userId: newUser._id,
            amount: newUser.balance,
            date: new Date(),
            description: 'Initial',
        });

        return newUser;
    }

    /**
     * Retrieves all users along with their corresponding balance histories.
     * @returns An array of user documents, each enriched with their balance histories.
     */
    async findAll(): Promise<any[]> {
        const users = await this.userModel.find().exec();
        return Promise.all(users.map(async (user) => {
            const balanceHistories = await this.balanceHistoryModel.find({ userId: user._id }).exec();
            return { ...user.toJSON(), balanceHistories };
        }));
    }

    /**
     * Retrieves all users without their balance histories.
     * @returns An array of all user documents.
     */
    async findAllUsers(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    /**
     * Finds a user by their email address.
     * @param email The email address to search for.
     * @returns The user document matching the email address, if found.
     */
    async findUserByEmail(email: string): Promise<User> {
        return this.userModel.findOne({ email: email }).exec();
    }

    /**
     * Deletes a user based on their email address.
     * @param email The email address of the user to be deleted.
     */
    async deleteByEmail(email: string): Promise<void> {
        await this.userModel.deleteOne({ email });
    }

    /**
     * Deletes all balance history records associated with a specific user ID.
     * @param userId The ID of the user whose balance history records should be deleted.
     */
    async deleteBalanceHistoryByUserId(userId: string): Promise<void> {
        await this.balanceHistoryModel.deleteMany({ userId }).exec();
    }

    /**
     * Updates the balances for all users immediately, based on their employee type and either the daily rate or the calculated monthly rate.
     */
    async updateBalancesNow(): Promise<void> {
        const users = await this.userModel.find().exec();
        const currentDate = new Date();
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        await Promise.all(users.map(async (user) => {
            let amount = 0;

            if (user.employeeType === 'monthly') {
                amount = Math.floor(user.baseSalary / daysInMonth);
            } else if (user.employeeType === 'daily') {
                amount = user.dailyRate;
            }

            await this.updateBalance(user._id.toString(), amount, 'daily deposit');
        }));
    }

    /**
     * Updates a user's balance and records the transaction in the balance history.
     * @param userId The ID of the user whose balance is to be updated.
     * @param amount The amount by which to update the balance.
     * @param description A description of the balance update.
     */
    async updateBalance(userId: string, amount: number, description: string): Promise<void> {
        const user = await this.userModel.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        user.balance += amount;
        await user.save();

        await this.balanceHistoryModel.create({
            userId: user._id,
            amount,
            date: new Date(),
            description: description,
        });
    }

    /**
     * Processes a withdrawal request for a user, updating their balance and recording the transaction if sufficient funds are available.
     * @param userId The ID of the user making the withdrawal.
     * @param amount The amount to withdraw.
     * @returns An object indicating the success or failure of the withdrawal and any relevant messages.
     */
    async withdraw(userId: string, amount: number): Promise<{ success: boolean; message?: string }> {
        const user = await this.userModel.findById(userId);

        if (!user) {
            return { success: false, message: 'User not found.' };
        }

        if (user.balance < amount) {
            return { success: false, message: 'Insufficient balance.' };
        }

        user.balance -= amount;

        await user.save();

        // Record the withdrawal transaction in the Withdrawal collection
        await this.balanceHistoryModel.create({
            userId: user._id,
            amount,
            date: new Date(),
            description: 'withdraw',
        });

        return { success: true }; // Withdrawal successful
    }
}
