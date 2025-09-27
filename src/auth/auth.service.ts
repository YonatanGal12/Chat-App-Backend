import { Injectable } from '@nestjs/common';
import { AuthDto, FullJwtDto, PartialJwtDto, SignInDto, SignUpDto } from './dto/authDto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type Response } from 'express';
import { Req, Res } from '@nestjs/common';

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

    async authenticateUser(authDto: AuthDto, res:Response): Promise<PartialJwtDto>{
        const user = await this.validateUser(authDto);
        if(!user)
            throw new UnauthorizedException();

        return this.signIn(user, res);
        
    }

    async signIn(signInDto: SignInDto, res: Response): Promise<PartialJwtDto>{
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
            userId: signInDto.userId,
            userName: signInDto.userName
        }
    }

    async signUp(signUpDto: SignUpDto, res: Response){

        const possibleExistingUser = await this.usersService.findUserByUserName(signUpDto.userName);

        if(possibleExistingUser)
            throw new UnauthorizedException("Username already exists.");

        const user = await this.usersService.createUser(signUpDto);

        return this.signIn({ userId: user.id, userName: user.userName }, res);
    }

    async refreshAccessToken(@Req() req, @Res() res: Response){
        const refreshToken = req.cookies['refreshToken'];
        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }
        
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_TOKEN_SECRET,
            });

            const user = await this.usersService.findUserById(payload.sub);
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            const accessToken = await this.jwtService.signAsync({
                sub: user.id,
                userName: user.userName,
            });

            // Return the new access token
            return res.json({ accessToken });

        } 
        catch (err) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

    }
}
