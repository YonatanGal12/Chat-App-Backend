import { Controller, Post, Body, Get, Param, ParseIntPipe, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/authDto';
import { AuthGuard } from './guards/auth.guard';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('login')
    login(@Body() authDto: AuthDto, @Res() res: Response){
        return this.authService.authenticateUser(authDto,res);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    getUserInfo(@Param('id',ParseIntPipe) id: number, @Req() req){
        return req.user;
    }

    @Get('refresh')
    refresh(@Req() req){
        return req.cookies['refreshToken'];        
    }
}
