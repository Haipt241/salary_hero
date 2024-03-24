import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {HttpException} from "@nestjs/common";

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    // Create a mock UserService
    const mockUserService = {
      findAll: jest.fn(() => Promise.resolve(['user1', 'user2'])), // Mock findAll method
      withdraw: jest.fn((userId, amount) => Promise.resolve({ success: true })) // Mock withdraw method
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      // Provide the mock instead of the real service
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('showUsers', () => {
    it('should return an array of users', async () => {
      await expect(controller.showUsers()).resolves.toEqual({ users: ['user1', 'user2'] });
      expect(userService.findAll).toHaveBeenCalled();
    });
  });

  describe('withdraw', () => {
    it('should successfully withdraw funds', async () => {
      const userId = 'testId';
      const amount = 100;
      await expect(controller.withdraw({ userId, amount })).resolves.toEqual({ success: true });
      expect(userService.withdraw).toHaveBeenCalledWith(userId, amount);
    });

    it('should throw HttpException on failure', async () => {
      userService.withdraw = jest.fn(() => Promise.resolve({ success: false, message: 'Insufficient balance.' }));
      const userId = 'testId';
      const amount = 200;
      await expect(controller.withdraw({ userId, amount })).rejects.toThrow(HttpException);
      expect(userService.withdraw).toHaveBeenCalledWith(userId, amount);
    });
  });
});
