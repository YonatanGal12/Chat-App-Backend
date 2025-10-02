import { Controller, Post, Body, Get, Param, ParseIntPipe, UseGuards, Req, Res, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, SignUpDto } from './dto/authDto';
import { AuthGuard } from './guards/auth.guard';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('login')
    async login(@Body() authDto: AuthDto, @Res() res: Response){
        return this.authService.authenticateUser(authDto,res);
    }

    @Post('signUp')
    async signUp(@Body() signUpDto: SignUpDto, @Res() res: Response){
        console.log("new User:", signUpDto);
        return this.authService.signUp(signUpDto, res);
    }

    @Put('refresh')
    async refresh(@Body() body, @Res() res: Response){
        return this.authService.refreshAccessToken(body, res);;        
    }
}
