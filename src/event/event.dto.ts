import { IsNotEmpty, IsString, ArrayNotEmpty, IsArray } from 'class-validator';


export class MessageDto{
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    sender: string
}

export class NewGCDto {

    @IsString()
    @IsNotEmpty({ message: 'Name must not be empty' })
    name: string;

    @IsArray()
    @ArrayNotEmpty({ message: 'Users list must not be empty' })
    @IsString({ each: true })
    users: string[];
}