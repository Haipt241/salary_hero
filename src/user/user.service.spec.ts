import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import {Model} from "mongoose";
import {User} from "../models/user.schema";
import {BalanceHistory} from "../models/balanceHistory.schema";

describe('UserService', () => {
  let service: UserService;
  let userModelMock: any;
  let balanceHistoryModelMock: any;

  beforeEach(async () => {
    userModelMock = {
      find: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([{
        _id: 'userId',
        balance: 1000,
        employeeType: 'daily',
        toJSON: function() { return this; }
      }]),
      findById: jest.fn().mockResolvedValue({
        _id: 'userId',
        balance: 1000,
        employeeType: 'daily',
        save: jest.fn().mockResolvedValue(true),
      }),
      deleteOne: jest.fn().mockResolvedValue(true),
      create: jest.fn(),
      findOne: jest.fn().mockResolvedValue(true),
    };
    balanceHistoryModelMock = {
      find: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      deleteMany: jest.fn().mockResolvedValue([])
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: userModelMock,
        },
        {
          provide: getModelToken('BalanceHistory'),
          useValue: balanceHistoryModelMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should add a new user and return it, also creating an initial balance history', async () => {
    const createUserDto = { email: 'new@example.com', balance: 500 };
    const newUser = { ...createUserDto, _id: 'someId' };
    userModelMock.create.mockResolvedValue(newUser);

    const expectedBalanceHistory = {
      userId: newUser._id,
      amount: newUser.balance,
      date: expect.any(Date),
      description: 'Initial',
    };
    balanceHistoryModelMock.create.mockResolvedValue(expectedBalanceHistory);

    const result = await service.create(createUserDto);

    expect(result).toEqual(newUser);
    expect(userModelMock.create).toHaveBeenCalledWith(createUserDto);
    expect(balanceHistoryModelMock.create).toHaveBeenCalledWith({
      userId: newUser._id,
      amount: newUser.balance,
      date: expect.any(Date),
      description: 'Initial',
    });
  });


  it('findAll should return all users with their withdrawals', async () => {
    const users = await service.findAll();
    expect(users).toHaveLength(1);
    expect(userModelMock.find).toHaveBeenCalled();
    expect(balanceHistoryModelMock.find).toHaveBeenCalledWith({ userId: 'userId' });
  });

  describe('findUserByEmail', () => {
    it('should return a user by email', async () => {
      const mockUser = {
        _id: 'someId',
        email: 'test@example.com',
        name: 'Test User',
      };

      userModelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const email = 'test@example.com';
      const result = await service.findUserByEmail(email);

      expect(userModelMock.findOne).toHaveBeenCalledWith({ email: email });
      expect(result).toEqual(mockUser);
    });
  });

  it('should return null if user not found', async () => {
    userModelMock.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const email = 'notfound@example.com';
    const result = await service.findUserByEmail(email);

    expect(userModelMock.findOne).toHaveBeenCalledWith({ email: email });
    expect(result).toBeNull();
  });

  it('deleteByEmail should remove a user by email', async () => {
    await service.deleteByEmail('test@example.com');
    expect(userModelMock.deleteOne).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('should delete balance histories by userId', async () => {
    const userId = 'someUserId';

    // Mock the behavior of the balanceHistoryModel.deleteMany method
    balanceHistoryModelMock.deleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 1 }), // Assume 1 document is deleted
    });

    await service.deleteBalanceHistoryByUserId(userId);

    // Verify that deleteMany is called with the correct argument
    expect(balanceHistoryModelMock.deleteMany).toHaveBeenCalledWith({ userId });
    // Additionally, you might want to check if exec was called
    expect(balanceHistoryModelMock.deleteMany().exec).toHaveBeenCalled();
  });

  it('should update balances now correctly for all users', async () => {
    // Mock the updateBalance method to verify its calls
    service.updateBalance = jest.fn();
    // Setup mock users
    const mockUsers = [
      { _id: '1', employeeType: 'monthly', baseSalary: 3000, dailyRate: undefined },
      { _id: '2', employeeType: 'daily', baseSalary: undefined, dailyRate: 100 },
    ];
    userModelMock.exec.mockResolvedValue(mockUsers);

    // Calculate expected amounts
    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const expectedMonthlyAmount = Math.floor(3000 / daysInMonth);
    const expectedDailyAmount = 100;

    // Execute the method under test
    await service.updateBalancesNow();

    // Verify that updateBalance was called correctly
    expect(service.updateBalance).toHaveBeenCalledWith('1', expectedMonthlyAmount, 'daily deposit');
    expect(service.updateBalance).toHaveBeenCalledWith('2', expectedDailyAmount, 'daily deposit');
    expect(service.updateBalance).toHaveBeenCalledTimes(mockUsers.length);
  });


  describe('withdraw', () => {
    it('should throw an error if user not found', async () => {
      userModelMock.findById.mockResolvedValueOnce(null);
      await expect(service.withdraw('userId', 100)).resolves.toEqual({
        success: false,
        message: 'User not found.',
      });
    });

    it('should throw an error if insufficient balance', async () => {
      userModelMock.findById.mockResolvedValueOnce({ _id: 'userId', balance: 50, save: jest.fn() });
      await expect(service.withdraw('userId', 100)).resolves.toEqual({
        success: false,
        message: 'Insufficient balance.',
      });
    });

    it('should withdraw successfully and return success', async () => {
      await expect(service.withdraw('userId', 100)).resolves.toEqual({
        success: true,
      });
      expect(userModelMock.findById).toHaveBeenCalledWith('userId');
      expect(balanceHistoryModelMock.create).toHaveBeenCalledWith({
        userId: 'userId',
        amount: 100,
        date: expect.any(Date),
        description: 'withdraw',
      });
    });
  });
});
