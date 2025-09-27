import { Controller, Post, Body, Get, Param, ParseIntPipe, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, SignUpDto } from './dto/authDto';
import { AuthGuard } from './guards/auth.guard';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('login')
    async login(@Body() authDto: AuthDto, @Res({passthrough: true}) res: Response){
        return this.authService.authenticateUser(authDto,res);
    }

    @Post('signUp')
    async signUp(@Body() signUpDto: SignUpDto, @Res({passthrough: true}) res: Response){
        console.log("new User:", signUpDto);
        return this.authService.signUp(signUpDto, res);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async getUserInfo(@Param('id',ParseIntPipe) id: number, @Req() req){
        return req.user;
    }

    @Get('refresh')
    async refresh(@Req() req){
        return req.cookies['refreshToken'];        
    }
}
