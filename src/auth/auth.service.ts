import { Injectable } from '@nestjs/common';
import { AuthDto, FullJwtDto, SignInDto } from './dto/authDto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { strict } from 'assert';

@Injectable()
export class AuthService {

    constructor(private usersService: UsersService, private jwtService: JwtService) {}

    async validateUser(authDto: AuthDto): Promise<SignInDto | null>{
        const user = await this.usersService.findUserByUserName(authDto.userName);
        if(!user)
            throw new UnauthorizedException('Invalid username.');

        const doesPasswordMatch = await bcrypt.compare(authDto.password, user.password);
        if(doesPasswordMatch){
            return {
                userId: user.id,
                userName: user.userName
            }
        }
        throw new UnauthorizedException('Wrong password.');
    }

    async authenticateUser(authDto: AuthDto, res:Response): Promise<FullJwtDto>{
        const user = await this.validateUser(authDto);
        if(!user)
            throw new UnauthorizedException();

        return this.signIn(user, res);
        
    }

    async signIn(signInDto: SignInDto, res: Response): Promise<FullJwtDto>{
        const tokenPayload = {
            sub: signInDto.userId,
            userName: signInDto.userName
        }

        const accessToken = await this.jwtService.signAsync(tokenPayload);
        const refreshToken = await this.jwtService.signAsync(tokenPayload, {
            secret: process.env.JWT_REFRESH_TOKEN_SECRET,
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN
        })
        
        res.cookie('refreshToken',refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 604800000,
            path: '/auth/refresh'
        })

        return{
            accessToken,
            refreshToken,
            userId: signInDto.userId,
            userName: signInDto.userName
        }
    }
}
