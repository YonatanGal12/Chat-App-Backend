import { OmitType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class AuthDto {
    @IsNotEmpty()
    @IsString()
    userName: string

    @IsNotEmpty()
    @IsString()
    password: string
}

export class SignInDto {
    @IsNotEmpty()
    @IsNumber()
    userId: number

    @IsNotEmpty()
    @IsString()
    userName: string
}

export class AuthResultDto extends SignInDto {
    @IsNotEmpty()
    @IsString()
    accessToken: string;
}
