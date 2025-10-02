import { Injectable, NotFoundException } from "@nestjs/common"
import { DatabaseService } from "src/database/database.service"
import { ChatDto } from "./dto/chatDto"
import { Prisma } from "@prisma/client"
import { NewGCDto } from "src/event/event.dto"

@Injectable()
export class ChatService {
    constructor(private readonly databaseService: DatabaseService) {}


    async createNewChat(createChatDto: NewGCDto) {
      const users = await this.databaseService.user.findMany({
          where: { userName: { in: createChatDto.users } },
      });

      const chatData: Prisma.ChatCreateInput = {
          chatName: createChatDto.name,
          chatMembers: {
              create: users.map(user => ({
                  userId: user.id,
              })),
          }
      }

      return this.databaseService.chat.create({
          data: chatData,
          include: { 
              chatMembers: true 
          },
      })
    }

    async getAllChats() {
        return this.databaseService.chat.findMany({
            include: { chatMembers: true },
        })
    }


    async getChatById(id: number) {
        const chat = await this.databaseService.chat.findUnique({
            where: { id },
            include: { chatMembers: true },
        })

        if (!chat) 
            throw new NotFoundException(`Chat with id ${id} not found`)

        return chat
    }

    async getChatIdByName(name: string) {
        const chatId = await this.databaseService.chat.findFirst({
            where: { chatName: name },
            select: { id: true },
        })

        if (!chatId) 
            throw new NotFoundException(`Chat with name ${name} not found`)

        return chatId.id;
    }



    async deleteChat(id: number) {
      return this.databaseService.chat.delete({
        where: { id },
      })
    }


    async addMemberToChat(chatId: number, userId: number) {
      return this.databaseService.chatMember.create({
        data: {
          chatId,
          userId,
        },
      })
    }


    async removeMemberFromChat(chatId: number, userId: number) {
      return this.databaseService.chatMember.deleteMany({
        where: {
          chatId,
          userId,
        },
      })
    }

    async getAllChatsForUser(userId: number) {
      return this.databaseService.chat.findMany({
        where: {
          chatMembers: {
            some: { userId }
          }
        },
        select: {
          chatName: true,
          chatMembers: {
            select: {
                user: {
                    select: {
                        userName: true
                    }
                }
            }
          },
        },
      });
    }

    async getAllMessagesFromChat(chatName: string){
        const chatWithMessages = await this.databaseService.chat.findFirst({
            where: { chatName },
            select: {
                messages: {
                  select: {
                      content: true,
                      user: {
                          select: {
                            userName: true
                          }
                      },
                      sentAt: true
                  },
                  orderBy: {
                    sentAt: "asc"
                  }
                }
            }
        })

        if (!chatWithMessages) return [];

        return chatWithMessages.messages.map(msg => ({
          content: msg.content,
          sender: msg.user.userName,
        }));

    }

}
