import { PartialType } from "@nestjs/mapped-types"
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator"

export class UserDto{
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

    @IsBoolean()
    isLoggedIn?: boolean
}

export class UpdateUserDto extends PartialType(UserDto){}