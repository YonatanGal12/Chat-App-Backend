import { PartialType } from "@nestjs/mapped-types"
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator"

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
}

export class UpdateUserDto extends PartialType(UserDto){}