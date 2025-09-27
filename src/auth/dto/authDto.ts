import { OmitType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsNumber, IsString, IsEmail, IsOptional, IsPhoneNumber } from "class-validator";


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

export class SignUpDto{
    @IsNotEmpty()
    @IsString()
    userName: string

    @IsNotEmpty()
    @IsString()
    password: string

    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsOptional()
    @IsPhoneNumber("IL")
    phoneNumber?: string
}

export class PartialJwtDto extends SignInDto {
    @IsNotEmpty()
    @IsString()
    accessToken: string;
}

export class FullJwtDto extends PartialJwtDto {
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}
