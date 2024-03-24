import {Body, Controller, Get, HttpException, HttpStatus, Post, Render} from '@nestjs/common';
import { UserService } from './user.service';

// Defines a controller with the base route 'user'
@Controller('user')
export class UserController {
    // Injects UserService to interact with user data
    constructor(private userService: UserService) {}

    // Handles GET requests to '/user', rendering the userList template with user data
    @Get()
    @Render('userList') // Specifies the template to be rendered
    async showUsers() {
        const users = await this.userService.findAll(); // Retrieves all users
        return { users }; // Passes users to the template
    }

    // Handles POST requests to '/user/withdraw', withdrawing funds for a user
    @Post('withdraw')
    async withdraw(@Body() withdrawRequest: { userId: string; amount: number }) {
        const result = await this.userService.withdraw(
            withdrawRequest.userId,
            withdrawRequest.amount, // Processes the withdrawal
        );
        // If withdrawal was unsuccessful, throws an HTTP exception with a bad request status
        if (!result.success) {
            throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
        }
        return result; // Returns the result of the withdrawal operation
    }

    @Post('update-balances-now')
    async updateBalancesNow() {
        try {
            await this.userService.updateBalancesNow();
            return { message: 'Balances updated successfully for all users' };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
