import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { UpdateUserDto, UserDto } from './dto/userDto';
import { validateOrReject } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { hash } from 'crypto';

@Injectable()
export class UsersService {

  constructor(private readonly databaseService: DatabaseService){}

  async createUser(createUserDto: UserDto) {

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const userData: Prisma.UserCreateInput = {
      userName: createUserDto.userName,
      password: hashedPassword,
      email: createUserDto.email,
      ...(createUserDto.phoneNumber !== undefined && {phoneNumber: createUserDto.phoneNumber})
    }

    return this.databaseService.user.create({
      data: userData
    })
  }

  async findAllUsers() {
    return this.databaseService.user.findMany({});
  }

  async findUserById(id: number) {
    return this.databaseService.user.findUnique({
      where: { id },
      include: {
        chatMembers: {
          include: {
            chat: true, 
          },
        },
      },
    });
  }

  async findUserByUserName(userName: string) {
    return this.databaseService.user.findUnique({
      where: { userName }
    });
  }

  async findUsersByUserNames(userNames: string[]) {
    return this.databaseService.user.findMany({
      where: { userName: {
        in: userNames
      } }
    });
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {

    let hashedPassword;
    if(updateUserDto.password)
      hashedPassword = await bcrypt.hash(updateUserDto.password, 10);

    const updatedUser: Prisma.UserUpdateInput = {
      ...(updateUserDto.userName && {userName: updateUserDto.userName}),
      ...(updateUserDto.password && {password: hashedPassword}),
      ...(updateUserDto.email && {email: updateUserDto.email}),
      ...(updateUserDto.phoneNumber !== undefined && {phoneNumber: updateUserDto.phoneNumber}),
      ...(updateUserDto.isLoggedIn !== undefined && {isLoggedIn: updateUserDto.isLoggedIn})
    }

    return this.databaseService.user.update({
      where: { id },
      data: updatedUser
    })
  }

  async deleteUser(id: number) {
    return this.databaseService.user.delete({
      where: { id }
    });
  }
}
