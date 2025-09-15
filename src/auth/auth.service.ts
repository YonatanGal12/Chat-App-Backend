import { Injectable } from '@nestjs/common';
import { AuthDto, AuthResultDto, SignInDto } from './dto/authDto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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

    async authenticateUser(authDto: AuthDto): Promise<AuthResultDto>{
        const user = await this.validateUser(authDto);
        if(!user)
            throw new UnauthorizedException();

        return this.signIn(user);
        
    }

    async signIn(signInDto: SignInDto): Promise<AuthResultDto>{
        const tokenPayload = {
            sub: signInDto.userId,
            userName: signInDto.userName
        }

        const accessToken = await this.jwtService.signAsync(tokenPayload);

        return{
            accessToken,
            userId: signInDto.userId,
            userName: signInDto.userName
        }
    }
}
