import * as mongoose from 'mongoose';

export interface User extends Document {
    _id: string
    name: string;
    email: string;
    baseSalary?: number;
    dailyRate?: number;
    employeeType: string;
    startDate: Date;
    balance: number;
}

// Define a schema for users, including personal info, salary details, and withdrawal history.
export const UserSchema = new mongoose.Schema({
    name: { type: String, required: true }, // User's name
    email: { type: String, required: true, unique: true }, // User's email, must be unique
    baseSalary: { type: Number, default: 0 }, // Base salary if working full month
    dailyRate: { type: Number, default: 0 }, // Daily wage rate
    employeeType: { type: String, default: 0 }, // Employee type
    startDate: { type: Date, required: true }, // The start date of employment
    balance: { type: Number, default: 0 }, // Current balance of the employee
}, { collection: 'users' });
