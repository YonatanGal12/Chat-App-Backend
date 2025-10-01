import { IsNotEmpty, IsString, ValidateNested, ArrayNotEmpty } from "class-validator"
import { Type } from "class-transformer"
import { UserDto } from "src/users/dto/userDto"

export class ChatDto {
  @IsNotEmpty()
  @IsString()
  chatName: string

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UserDto)
  members: UserDto[]
}
