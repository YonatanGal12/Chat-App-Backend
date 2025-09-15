import { Controller, Post, Body, Get, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/authDto';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('login')
    login(@Body() authDto: AuthDto){
        return this.authService.authenticateUser(authDto);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    getUserInfo(@Param('id',ParseIntPipe) id: number, @Request() request){
        return request.user;
    }
}
