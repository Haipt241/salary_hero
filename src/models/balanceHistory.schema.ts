import * as mongoose from 'mongoose';
import {Schema} from "mongoose";

export interface BalanceHistory extends Document {
    userId: Schema.Types.ObjectId;
    amount: number;
    date: Date;
    description: string;
}

// Define a schema for balance history records, specifying the amount, date, and type of withdrawal.
export const BalanceHistorySchema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' }, // Reference to User model
    amount: Number, // The amount of money change
    date: { type: Date, default: () => Date.now() }, // The date of changing, defaults to the current date
    description: String, // Description about history
}, { collection: 'balance_histories' });